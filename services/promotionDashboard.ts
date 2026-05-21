import { ACTIVE_TEMPLATE_REGISTRY, TEMPLATE_REGISTRY } from '../template-routing-lab/src/templates/registry.js';
import { generateLowTurtleModel } from '../template-routing-lab/src/templates/generators/turtleLowGenerator.js';
import { generateSmallBoatModel } from '../template-routing-lab/src/templates/generators/boatSmallGenerator.js';
import { buildPromotionVisualizationReport } from '../template-routing-lab/src/promotion/promotionVisualization.js';
import { evaluateTemplatePromotion } from '../template-routing-lab/src/promotion/evaluateTemplatePromotion.js';
import { TemplateRoutingLogger } from '../template-routing-lab/src/logging/templateRoutingLogger.js';
import { MemoryLogStorage } from '../template-routing-lab/src/logging/memoryLogStorage.js';
import type {
  PromotionEvaluation,
  PromotionVisualizationReport,
  TemplateRoutingLogEvent,
} from '../template-routing-lab/src/contracts/index.js';

const BASELINE_ACTIVE_TEMPLATE_COUNT = 4;
const BASELINE_CATEGORY_COUNT = 1;

export interface PromotionDashboardRow {
  templateId: string;
  templateName: string;
  category: string;
  decision: string;
  totalScore: number;
  metadataScore: number;
  geometryScore: number;
  retrievalScore: number;
  routeScore: number;
  complianceScore: number;
  voxelCount: number | null;
  voxelBudget: string;
  positivePassed: string;
  negativePassed: string;
  failedChecks: string;
}

export interface PromotionCoverageDelta {
  metric: string;
  before: number | string;
  after: number | string;
  delta: number | string;
}

export interface PromotionDashboardData {
  generatedAt: string;
  activeTemplateCount: number;
  candidateTemplateCount: number;
  activeCategoryCount: number;
  evaluations: PromotionEvaluation[];
  visualization: PromotionVisualizationReport;
  rows: PromotionDashboardRow[];
  coverageDeltas: PromotionCoverageDelta[];
  logEvents: TemplateRoutingLogEvent[];
}

function requireTemplate(templateId: string) {
  const template = TEMPLATE_REGISTRY.find((entry) => entry.metadata.id === templateId);
  if (!template) {
    throw new Error(`Missing template ${templateId}`);
  }
  return template;
}

function countPassed(checks: PromotionEvaluation['positiveChecks']): string {
  const passed = checks.filter((check) => check.passed).length;
  return `${passed}/${checks.length}`;
}

function toDashboardRow(evaluation: PromotionEvaluation): PromotionDashboardRow {
  const { minVoxelCount, maxVoxelCount, voxelCount } = evaluation.geometry;

  return {
    templateId: evaluation.templateId,
    templateName: evaluation.templateName,
    category: evaluation.category,
    decision: evaluation.decision,
    totalScore: evaluation.totalScore,
    metadataScore: evaluation.scoreBreakdown.metadata,
    geometryScore: evaluation.scoreBreakdown.geometry,
    retrievalScore: evaluation.scoreBreakdown.retrieval,
    routeScore: evaluation.scoreBreakdown.route,
    complianceScore: evaluation.scoreBreakdown.compliance,
    voxelCount: voxelCount ?? null,
    voxelBudget: `${minVoxelCount}-${maxVoxelCount}`,
    positivePassed: countPassed(evaluation.positiveChecks),
    negativePassed: countPassed(evaluation.negativeChecks),
    failedChecks: evaluation.failedChecks.length === 0 ? 'none' : evaluation.failedChecks.join('; '),
  };
}

function buildCoverageDeltas(): PromotionCoverageDelta[] {
  const activeCategories = new Set(ACTIVE_TEMPLATE_REGISTRY.map((entry) => entry.metadata.baseCategory));
  const candidateCount = TEMPLATE_REGISTRY.filter((entry) => entry.metadata.status === 'candidate').length;
  const activeTemplateDelta = ACTIVE_TEMPLATE_REGISTRY.length - BASELINE_ACTIVE_TEMPLATE_COUNT;
  const categoryDelta = activeCategories.size - BASELINE_CATEGORY_COUNT;

  return [
    {
      metric: 'active_templates',
      before: BASELINE_ACTIVE_TEMPLATE_COUNT,
      after: ACTIVE_TEMPLATE_REGISTRY.length,
      delta: activeTemplateDelta >= 0 ? `+${activeTemplateDelta}` : activeTemplateDelta,
    },
    {
      metric: 'active_categories',
      before: BASELINE_CATEGORY_COUNT,
      after: activeCategories.size,
      delta: categoryDelta >= 0 ? `+${categoryDelta}` : categoryDelta,
    },
    {
      metric: 'candidate_templates',
      before: 'manual review',
      after: candidateCount,
      delta: candidateCount === 0 ? 'cleared' : `${candidateCount} remaining`,
    },
  ];
}

export function buildPromotionDashboardData(): PromotionDashboardData {
  const turtleModel = generateLowTurtleModel({
    color: {
      shell: '#3f7f3a',
      body: '#6fb35f',
      belly: '#d6c56a',
      eyes: '#111111',
    },
  });

  const boatModel = generateSmallBoatModel({
    color: {
      hull: '#2d6cdf',
      deck: '#f0f0e6',
      cabin: '#ffffff',
      windows: '#83cbe8',
      trim: '#1c335f',
    },
  });

  const evaluations = [
    evaluateTemplatePromotion({
      template: requireTemplate('exp-turtle-low'),
      templates: ACTIVE_TEMPLATE_REGISTRY,
      positivePrompts: ['turtle', 'cute turtle', 'sea turtle', 'pond turtle'],
      negativePrompts: ['car', 'bus', 'house', 'penguin'],
      fromStatus: 'candidate',
      toStatus: 'active',
      geometryVoxelCount: turtleModel.stats.totalVoxels,
    }),
    evaluateTemplatePromotion({
      template: requireTemplate('exp-boat-small'),
      templates: ACTIVE_TEMPLATE_REGISTRY,
      positivePrompts: ['boat', 'small boat', 'fishing boat', 'rescue boat'],
      negativePrompts: ['animal', 'house', 'car', 'penguin'],
      fromStatus: 'candidate',
      toStatus: 'active',
      geometryVoxelCount: boatModel.stats.totalVoxels,
    }),
  ];

  const storage = new MemoryLogStorage();
  const logger = new TemplateRoutingLogger(storage);
  evaluations.forEach((evaluation) => logger.logTemplatePromotion(evaluation));

  const activeCategories = new Set(ACTIVE_TEMPLATE_REGISTRY.map((entry) => entry.metadata.baseCategory));

  return {
    generatedAt: new Date().toISOString(),
    activeTemplateCount: ACTIVE_TEMPLATE_REGISTRY.length,
    candidateTemplateCount: TEMPLATE_REGISTRY.filter((entry) => entry.metadata.status === 'candidate').length,
    activeCategoryCount: activeCategories.size,
    evaluations,
    visualization: buildPromotionVisualizationReport(evaluations),
    rows: evaluations.map(toDashboardRow),
    coverageDeltas: buildCoverageDeltas(),
    logEvents: logger.listEvents(),
  };
}

function escapeCsvValue(value: unknown): string {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function promotionRowsToCsv(rows: PromotionDashboardRow[]): string {
  const headers: Array<keyof PromotionDashboardRow> = [
    'templateId',
    'templateName',
    'category',
    'decision',
    'totalScore',
    'metadataScore',
    'geometryScore',
    'retrievalScore',
    'routeScore',
    'complianceScore',
    'voxelCount',
    'voxelBudget',
    'positivePassed',
    'negativePassed',
    'failedChecks',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ];

  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
