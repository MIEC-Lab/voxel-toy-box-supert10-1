// File: C:\Users\94234\Downloads\voxel-toy-box-supert10-1-main\components\TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bird, Cat, Rabbit, Users, ChevronDown, Plus, Share2, Pause, Play, Palette, Layers, Maximize2, FlipHorizontal } from 'lucide-react';
import { AdvancedParams } from './AdvancedParametersPanel';
import { AppMode } from './ModeSelection';

/**
 * 预设模型类型
 */
export type PresetModel = 'Eagle' | 'Cat' | 'Rabbit' | 'Twins';

/**
 * 顶部导航栏组件属性
 */
interface TopBarProps {
  appMode: AppMode;               // 应用模式（快速/专家）
  selectedModel: PresetModel;      // 当前选中的模型
  onSelectModel: (model: PresetModel) => void;  // 模型选择回调
  onAddModel?: () => void;         // 添加模型回调（可选）
  isAutoRotate: boolean;           // 是否自动旋转
  onToggleRotate: () => void;      // 切换旋转状态回调
  onShare?: () => void;            // 分享功能回调（可选）
  voxelCount: number;              // 体素数量
  currentParams?: AdvancedParams;  // 当前高级参数（可选）
}

/**
 * 模型信息配置
 */
const MODEL_INFO: { [key in PresetModel]: { icon: React.ReactNode; label: string; color: string; bgColor: string } } = {
  Eagle: { icon: <Bird size={16} />, label: 'Eagle', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  Cat: { icon: <Cat size={16} />, label: 'Cat', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  Rabbit: { icon: <Rabbit size={16} />, label: 'Rabbit', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  Twins: { icon: <Users size={16} />, label: 'Twins', color: 'text-blue-600', bgColor: 'bg-blue-500' }
};

/**
 * 顶部导航栏组件
 * 包含模型选择、旋转控制、参数显示和分享功能
 */
export const TopBar: React.FC<TopBarProps> = ({
  appMode,
  selectedModel,
  onSelectModel,
  onAddModel,
  isAutoRotate,
  onToggleRotate,
  onShare,
  voxelCount,
  currentParams
}) => {
  // 模型菜单展开状态
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  // 菜单引用，用于点击外部关闭菜单
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * 监听点击事件，点击外部关闭模型菜单
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当前选中模型的信息
  const selectedInfo = MODEL_INFO[selectedModel];

  return (
    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-start z-20">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 模型选择器 */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-200">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">Model</span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 ${selectedInfo.bgColor}/10 hover:${selectedInfo.bgColor}/20 rounded-lg transition-all duration-200 font-semibold text-gray-700 border border-transparent hover:border-gray-300 text-sm`}
            >
              <span className={selectedInfo.color}>{selectedInfo.icon}</span>
              <span className="hidden sm:inline">{selectedInfo.label}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 模型下拉菜单 */}
            {isModelMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200 p-2 flex flex-col gap-1 animate-in fade-in zoom-in duration-200">
                {/* 模型选项 */}
                {(Object.keys(MODEL_INFO) as PresetModel[]).map((model) => {
                  const modelData = MODEL_INFO[model];
                  return (
                    <button
                      key={model}
                      onClick={() => {
                        onSelectModel(model);
                        setIsModelMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:${modelData.bgColor}/10 transition-all duration-150 ${
                        model === selectedModel ? `${modelData.bgColor}/10 border border-gray-300` : 'text-gray-700'
                      }`}
                    >
                      <span className={modelData.color}>{modelData.icon}</span>
                      <span className="font-medium">{modelData.label}</span>
                    </button>
                  );
                })}

                {/* 专家模式下显示添加模型按钮 */}
                {appMode === 'expert' && onAddModel && (
                  <>
                    <div className="h-px bg-gray-200 my-1" />
                    <button
                      onClick={() => {
                        onAddModel();
                        setIsModelMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-500/10 transition-all duration-150 text-blue-600"
                    >
                      <Plus size={18} />
                      <span className="font-medium">Add Model</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 旋转控制按钮 */}
        <button
          onClick={onToggleRotate}
          className={`p-2.5 rounded-xl shadow-lg transition-all duration-200 ${
            isAutoRotate
              ? 'bg-blue-500 text-white hover:bg-blue-400'
              : 'bg-white/90 backdrop-blur-xl text-gray-600 hover:bg-white border border-gray-200'
          }`}
          title={isAutoRotate ? 'Pause Rotation' : 'Auto Rotate'}
        >
          {isAutoRotate ? <Pause size={18} /> : <Play size={18} />}
        </button>

        {/* 专家模式下显示参数信息 */}
        {appMode === 'expert' && currentParams && (
          <div className="hidden lg:flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10">
              <Palette size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 capitalize">{currentParams.colorScheme}</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10">
              <Layers size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 capitalize">{currentParams.style}</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10">
              <Maximize2 size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 capitalize">{currentParams.size}</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10">
              <FlipHorizontal size={13} className="text-blue-500" />
              <span className="text-xs font-semibold text-gray-700 capitalize">{currentParams.symmetry}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 体素计数显示 */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200">
          <div className={`p-1.5 sm:p-2 rounded-lg ${selectedInfo.bgColor}/10`}>
            <span className={`${selectedInfo.color} font-black text-xs sm:text-sm`}>{voxelCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold hidden sm:inline">Voxels</span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium hidden sm:inline">{selectedInfo.label}</span>
          </div>
        </div>

        {/* 分享按钮 */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-sm"
          >
            <Share2 size={14} sm:size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;