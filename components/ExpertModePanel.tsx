import React, { useState } from 'react';
import { ChevronDown, Sun, Lightbulb, Box, RotateCcw, Check, ChevronLeft } from 'lucide-react';
import { PresetModel } from './TopBar';

export type DisplayMode = 'solid' | 'wireframe' | 'voxels';
export type BackgroundColor = 'gray' | 'dark' | 'white' | 'purple';

interface ExpertModePanelProps {
  selectedModel: PresetModel;
  onSelectModel: (model: PresetModel) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  backgroundColor: BackgroundColor;
  onBackgroundColorChange: (color: BackgroundColor) => void;
  gridEnabled: boolean;
  onGridToggle: () => void;
  onResetCamera: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const MODEL_OPTIONS: { value: PresetModel; label: string }[] = [
  { value: 'Eagle', label: 'Eagle' },
  { value: 'Cat', label: 'Cat' },
  { value: 'Rabbit', label: 'Rabbit' },
  { value: 'Twins', label: 'Twins' },
];

const DISPLAY_OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'voxels', label: 'Voxels' },
];

const BACKGROUND_OPTIONS: { value: BackgroundColor; color: string; border?: boolean }[] = [
  { value: 'gray', color: '#e5e7eb' },
  { value: 'dark', color: '#374151' },
  { value: 'white', color: '#ffffff', border: true },
  { value: 'purple', color: '#e9d5ff' },
];

export const ExpertModePanel: React.FC<ExpertModePanelProps> = ({
  selectedModel,
  onSelectModel,
  displayMode,
  onDisplayModeChange,
  backgroundColor,
  onBackgroundColorChange,
  gridEnabled,
  onGridToggle,
  onResetCamera,
  collapsed,
  onToggleCollapse,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        title="Open Settings"
      >
        <ChevronLeft size={18} className="text-gray-500" />
      </button>
    );
  }

  return (
    <div className="w-52 bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 space-y-3 relative">
      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        title="Collapse"
      >
        <ChevronLeft size={14} className="text-gray-400" />
      </button>

      {/* Model Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model</label>
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Box size={14} className="text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">{selectedModel}</span>
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {modelDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelectModel(opt.value);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                    selectedModel === opt.value ? 'text-indigo-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  <Box size={12} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Display Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Display</label>
        <div className="flex bg-gray-50 rounded-xl p-0.5">
          {DISPLAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDisplayModeChange(opt.value)}
              className={`flex-1 py-1.5 px-1 text-[11px] font-medium rounded-lg transition-all ${
                displayMode === opt.value
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Background</label>
        <div className="flex gap-2">
          {BACKGROUND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onBackgroundColorChange(opt.value)}
              className={`w-7 h-7 rounded-lg transition-all ${
                backgroundColor === opt.value
                  ? 'ring-2 ring-indigo-500 ring-offset-1'
                  : 'hover:scale-105'
              } ${opt.border ? 'border border-gray-200' : ''}`}
              style={{ backgroundColor: opt.color }}
            >
              {backgroundColor === opt.value && (
                <Check size={12} className={`mx-auto ${opt.value === 'white' || opt.value === 'gray' ? 'text-gray-600' : 'text-white'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Grid</label>
          <button
            onClick={onGridToggle}
            className={`relative w-9 rounded-full transition-colors ${
              gridEnabled ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
            style={{ height: '18px' }}
          >
            <div
              className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${
                gridEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Light Section */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Light</label>
        <div className="flex gap-2">
          <button className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500">
            <Sun size={14} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <Lightbulb size={14} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <Box size={14} />
          </button>
        </div>
      </div>

      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <RotateCcw size={12} />
        <span>Reset Camera</span>
      </button>
    </div>
  );
};

export default ExpertModePanel;
