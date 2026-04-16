// File: C:\Users\94234\Downloads\voxel-toy-box-supert10-1-main\components\BottomPanel.tsx
import React, { useState } from 'react';
import { PromptInput } from './PromptInput';
import { AdvancedParametersPanel, AdvancedParams } from './AdvancedParametersPanel';

/**
 * 底部面板组件属性
 */
interface BottomPanelProps {
  onSubmit: (prompt: string, params: AdvancedParams) => Promise<void>;  // 提交回调
  isGenerating: boolean;          // 是否正在生成
  onParamsChange?: (params: AdvancedParams) => void;  // 参数变更回调（可选）
  showAdvanced?: boolean;         // 是否显示高级参数（可选，默认true）
}

/**
 * 底部面板组件
 * 包含输入框和高级参数面板
 */
export const BottomPanel: React.FC<BottomPanelProps> = ({
  onSubmit,
  isGenerating,
  onParamsChange,
  showAdvanced = true
}) => {
  // 高级参数状态
  const [advancedParams, setAdvancedParams] = useState<AdvancedParams>({
    style: 'realistic',
    colorScheme: 'vibrant',
    size: 'medium',
    symmetry: 'none'
  });
  // 高级参数面板展开状态
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  /**
   * 处理参数变更
   * @param newParams 新的参数
   */
  const handleParamsChange = (newParams: AdvancedParams) => {
    setAdvancedParams(newParams);
    onParamsChange?.(newParams);
  };

  /**
   * 处理提交
   * @param prompt 用户输入的提示词
   */
  const handleSubmit = async (prompt: string) => {
    await onSubmit(prompt, advancedParams);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white/95 via-gray-100/90 to-transparent p-3 sm:p-4 pt-12 sm:pt-16 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
        {/* 输入框组件 */}
        <PromptInput
          onSubmit={handleSubmit}
          isGenerating={isGenerating}
        />
        {/* 高级参数面板（条件显示） */}
        {showAdvanced && (
          <AdvancedParametersPanel
            params={advancedParams}
            onChange={handleParamsChange}
            isExpanded={advancedExpanded}
            onToggle={() => setAdvancedExpanded(!advancedExpanded)}
          />
        )}
      </div>
    </div>
  );
};

export default BottomPanel;