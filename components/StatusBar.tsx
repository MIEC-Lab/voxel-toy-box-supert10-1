import React from 'react';
import { Copy, Check } from 'lucide-react';
import { AdvancedParams } from './AdvancedParametersPanel';

interface StatusBarProps {
  params: AdvancedParams;
  voxelCount: number;
  onCopy: () => void;
  isCopied: boolean;
}

const styleLabels = {
  realistic: 'Realistic',
  cartoon: 'Cartoon',
  abstract: 'Abstract'
};

const colorLabels = {
  vibrant: 'Vibrant',
  pastel: 'Pastel',
  monochrome: 'Monochrome',
  nature: 'Nature'
};

const sizeLabels = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large'
};

export const StatusBar: React.FC<StatusBarProps> = ({ params, voxelCount, onCopy, isCopied }) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Voxels</span>
          <span className="font-bold text-indigo-600">{voxelCount}</span>
        </div>

        <div className="w-px h-4 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Style</span>
          <span className="text-xs font-semibold text-slate-700">{styleLabels[params.style]}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Color</span>
          <span className="text-xs font-semibold text-slate-700">{colorLabels[params.colorScheme]}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Size</span>
          <span className="text-xs font-semibold text-slate-700">{sizeLabels[params.size]}</span>
        </div>
      </div>

      <button
        onClick={onCopy}
        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2 transition-colors"
      >
        {isCopied ? (
          <>
            <Check size={16} />
            <span className="text-sm font-bold">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span className="text-sm font-bold">Copy</span>
          </>
        )}
      </button>
    </div>
  );
};

export default StatusBar;