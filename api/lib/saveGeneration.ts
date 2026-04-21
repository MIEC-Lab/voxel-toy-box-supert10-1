import type { GenerationOptions, TemplateMatchResult } from '../../types';
import { getDb } from './db';

interface SaveGenerationInput {
  prompt: string;
  options: GenerationOptions;
  success: boolean;
  voxelCount: number;
  colorCount: number;
  warnings: string[];
  templateMatch: TemplateMatchResult | null;
  error?: string;
}

export async function saveGenerationRecord(input: SaveGenerationInput) {
  const db = getDb();

  if (!db.insertGenerationLog) {
    return;
  }

  await db.insertGenerationLog({
    prompt: input.prompt,
    generation_options: input.options,
    success: input.success,
    voxel_count: input.voxelCount,
    color_count: input.colorCount,
    warnings: input.warnings,
    template_match: input.templateMatch,
    error_message: input.error ?? null,
    created_at: new Date().toISOString(),
  });
}
