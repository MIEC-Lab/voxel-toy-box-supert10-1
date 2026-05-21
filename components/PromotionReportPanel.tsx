import React, { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  FileJson,
  Table,
  X,
} from 'lucide-react';
import {
  buildPromotionDashboardData,
  downloadTextFile,
  promotionRowsToCsv,
} from '../services/promotionDashboard';

interface PromotionReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export const PromotionReportPanel: React.FC<PromotionReportPanelProps> = ({ isOpen, onClose }) => {
  const data = useMemo(() => buildPromotionDashboardData(), []);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    downloadTextFile(
      'template-promotion-report.csv',
      promotionRowsToCsv(data.rows),
      'text/csv;charset=utf-8'
    );
  };

  const handleExportJson = () => {
    downloadTextFile(
      'template-promotion-report.json',
      JSON.stringify(data, null, 2),
      'application/json;charset=utf-8'
    );
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <section className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-white/10">
        <header className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-[0.24em]">
              <BarChart3 size={16} />
              Template Promotion Dashboard
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
              模板升格算法结果、日志与导出
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-3xl">
              这里展示的是网页端直接运行的升格评分链路：元数据完整度、几何预算、检索稳定性、路由稳定性和合规证据都会进入评分，并同步生成日志事件。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400 text-emerald-950 text-sm font-bold hover:bg-emerald-300 transition"
            >
              <Table size={16} />
              导出 CSV
            </button>
            <button
              onClick={handleExportJson}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition"
            >
              <FileJson size={16} />
              导出 JSON
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              aria-label="Close promotion report"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto max-h-[calc(92vh-132px)] p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-xs text-slate-400">Active Templates</div>
              <div className="mt-2 text-3xl font-black">{data.activeTemplateCount}</div>
              <div className="mt-1 text-xs text-emerald-300">从 4 个种子扩展而来</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-xs text-slate-400">Active Categories</div>
              <div className="mt-2 text-3xl font-black">{data.activeCategoryCount}</div>
              <div className="mt-1 text-xs text-blue-300">动物 / 车辆 / 建筑覆盖</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-xs text-slate-400">Average Promotion Score</div>
              <div className="mt-2 text-3xl font-black">{data.visualization.averageScore}</div>
              <div className="mt-1 text-xs text-emerald-300">升格候选平均分</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-xs text-slate-400">Log Events</div>
              <div className="mt-2 text-3xl font-black">{data.logEvents.length}</div>
              <div className="mt-1 text-xs text-slate-300">已写入前端日志视图</div>
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={18} className="text-emerald-300" />
                升格评分表
              </div>
              <div className="sm:hidden flex items-center gap-2">
                <button onClick={handleExportCsv} className="px-3 py-1.5 rounded-lg bg-emerald-400 text-emerald-950 text-xs font-bold">
                  CSV
                </button>
                <button onClick={handleExportJson} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold">
                  JSON
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-white/[0.06] text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3">模板</th>
                    <th className="text-left px-4 py-3">类别</th>
                    <th className="text-left px-4 py-3">决策</th>
                    <th className="text-right px-4 py-3">总分</th>
                    <th className="text-right px-4 py-3">元数据</th>
                    <th className="text-right px-4 py-3">几何</th>
                    <th className="text-right px-4 py-3">检索</th>
                    <th className="text-right px-4 py-3">路由</th>
                    <th className="text-right px-4 py-3">合规</th>
                    <th className="text-left px-4 py-3">Prompt 校验</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.templateId} className="border-t border-white/10 hover:bg-white/[0.04]">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{row.templateName}</div>
                        <div className="text-xs text-slate-400">{row.templateId}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{row.category}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full bg-emerald-400/15 text-emerald-200 text-xs font-bold">
                          {row.decision}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black">{row.totalScore}</td>
                      <td className="px-4 py-3 text-right">{row.metadataScore}</td>
                      <td className="px-4 py-3 text-right">{row.geometryScore}</td>
                      <td className="px-4 py-3 text-right">{row.retrievalScore}</td>
                      <td className="px-4 py-3 text-right">{row.routeScore}</td>
                      <td className="px-4 py-3 text-right">{row.complianceScore}</td>
                      <td className="px-4 py-3 text-slate-300">
                        + {row.positivePassed} / - {row.negativePassed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Activity size={18} className="text-blue-300" />
                前后版本覆盖对比
              </div>
              <div className="space-y-2">
                {data.coverageDeltas.map((delta) => (
                  <div key={delta.metric} className="grid grid-cols-4 gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-sm">
                    <div className="font-semibold text-slate-200">{delta.metric}</div>
                    <div className="text-slate-400">Before: {delta.before}</div>
                    <div className="text-slate-400">After: {delta.after}</div>
                    <div className="text-emerald-300 font-bold">{delta.delta}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Download size={18} className="text-emerald-300" />
                日志事件
              </div>
              <div className="space-y-2">
                {data.logEvents.map((event) => (
                  <div key={`${event.eventType}-${event.createdAt}-${'templateId' in event ? event.templateId : event.eventType}`} className="rounded-xl bg-white/[0.05] px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-100">{event.eventType}</span>
                      <span className="text-xs text-slate-400">{formatDateTime(event.createdAt)}</span>
                    </div>
                    {'templateId' in event && (
                      <div className="mt-1 text-slate-300">
                        {event.templateName} / {event.decision} / score {event.promotionScore}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromotionReportPanel;
