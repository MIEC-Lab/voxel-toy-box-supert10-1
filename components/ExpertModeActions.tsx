#Hujialuo
  
import React from 'react';
import { Hammer, Wrench, Download, Image as ImageIcon, Share2, Box, ChevronRight } from 'lucide-react';
import { GenerationMetadata } from '../types';

interface ExpertModeActionsProps {
  voxelCount: number;
  selectedModel: string;
  metadata?: GenerationMetadata;
  onDismantle: () => void;
  onRebuild: () => void;
  onExportJson: () => void;
  onExportObj: () => void;
  onScreenshot: () => void;
  onShare: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const ExpertModeActions: React.FC<ExpertModeActionsProps> = ({
  voxelCount,
  onDismantle,
  onRebuild,
  onExportJson,
  onExportObj,
  onScreenshot,
  onShare,
  collapsed,
  onToggleCollapse,
}) => {
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        title="Open Actions"
      >
        <ChevronRight size={18} className="text-gray-500" />
      </button>
    );
  }

  return (
    <div className="w-52 bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 space-y-3 relative">
      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-3 top-4 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        title="Collapse"
      >
        <ChevronRight size={14} className="text-gray-400" />
      </button>

      {/* Actions Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</label>
        <div className="flex gap-2">
          <button
            onClick={onDismantle}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-500 rounded-xl text-[11px] font-medium hover:bg-red-100 transition-colors"
          >
            <Hammer size={12} />
            Break
          </button>
          <button
            onClick={onRebuild}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-500 rounded-xl text-[11px] font-medium hover:bg-emerald-100 transition-colors"
          >
            <Wrench size={12} />
            Rebuild
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stats</label>
        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center w-9 h-9 bg-white rounded-lg shadow-sm">
            <Box size={16} className="text-indigo-500" />
          </div>
          <div>
            <div className="text-base font-bold text-gray-800">{voxelCount.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400">Voxels</div>
          </div>
          {/* Mini bar chart */}
          <div className="ml-auto flex items-end gap-0.5 h-6">
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-indigo-300 rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Export</label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onExportJson}
            className="flex items-center justify-center gap-1 py-2 bg-gray-50 rounded-xl text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <Download size={12} />
            .json
          </button>
          <button
            onClick={onExportObj}
            className="flex items-center justify-center gap-1 py-2 bg-gray-50 rounded-xl text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            <Download size={12} />
            .obj
          </button>
        </div>
        <button
          onClick={onScreenshot}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-50 rounded-xl text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100"
        >
          <ImageIcon size={12} />
          Screenshot
        </button>
      </div>

      {/* Share Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Share</label>
        <button
          onClick={onShare}
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-200"
        >
          <Share2 size={14} />
          Share Model
        </button>
      </div>
    </div>
  );
};

export default ExpertModeActions;
