/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData, GenerationMetadata, TemplateMatchResult } from './types';
import { BottomPanel } from './components/BottomPanel';
import { StatusPanel } from './components/StatusPanel';
import { AdvancedParams } from './components/AdvancedParametersPanel';
import { TopBar } from './components/TopBar';
import { PresetModel } from './components/ModelSelector';
import { ModeSelection, AppMode } from './components/ModeSelection';

/**
 * 主应用组件
 * 管理整个voxel玩具盒应用的状态和逻辑
 */
const App: React.FC = () => {
  // 容器引用，用于渲染3D场景
  const containerRef = useRef<HTMLDivElement>(null);
  // Voxel引擎引用，用于操作3D模型
  const engineRef = useRef<VoxelEngine | null>(null);

  // 应用状态管理
  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PresetModel>('Eagle');

  // 生成结果相关状态
  const [generationMetadata, setGenerationMetadata] = useState<GenerationMetadata | undefined>();
  const [templateMatch, setTemplateMatch] = useState<TemplateMatchResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  
  // 3D视图控制
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  
  // 高级参数设置
  const [currentParams, setCurrentParams] = useState<AdvancedParams>({
    style: 'realistic',
    colorScheme: 'vibrant',
    size: 'medium',
    symmetry: 'none'
  });
  
  // 应用模式（快速/专家）
  const [appMode, setAppMode] = useState<AppMode | null>(null);

  /**
   * 组件挂载时初始化
   * - 创建Voxel引擎实例
   * - 加载初始模型
   * - 监听窗口大小变化
   * - 自动隐藏欢迎屏幕
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => setAppState(newState),
      (count) => setVoxelCount(count)
    );

    engineRef.current = engine;
    engine.loadInitialModel(Generators.Eagle());

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => setShowWelcome(false), 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      engine.cleanup();
    };
  }, []);

  /**
   * 计算生成结果的元数据
   * @param voxels 体素数据数组
   * @returns 生成元数据对象
   */
  const calculateMetadata = (voxels: VoxelData[]): GenerationMetadata => {
    if (voxels.length === 0) {
      return { voxelCount: 0, colorCount: 0, dimensions: { width: 0, height: 0, depth: 0 } };
    }

    const xs = voxels.map(v => v.x);
    const ys = voxels.map(v => v.y);
    const zs = voxels.map(v => v.z);

    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const minZ = Math.min(...zs), maxZ = Math.max(...zs);

    const colors = new Set(voxels.map(v => v.color));
    const warnings: string[] = [];

    if (voxels.length > 5000) {
      warnings.push('High voxel count may affect performance');
    }
    if (colors.size > 50) {
      warnings.push('Many unique colors detected');
    }

    return {
      voxelCount: voxels.length,
      colorCount: colors.size,
      dimensions: {
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        depth: maxZ - minZ + 1
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  };

  /**
   * 处理模型切换
   * @param model 选中的预设模型
   */
  const handleModelChange = (model: PresetModel) => {
    setSelectedModel(model);
    if (engineRef.current) {
      const generator = Generators[model];
      if (generator) {
        engineRef.current.loadInitialModel(generator());
      }
    }
  };

  /**
   * 切换自动旋转状态
   */
  const handleToggleRotate = () => {
    const newState = !isAutoRotate;
    setIsAutoRotate(newState);
    if (engineRef.current) {
      engineRef.current.setAutoRotate(newState);
    }
  };

  /**
   * 添加模型功能（预留接口）
   */
  const handleAddModel = () => {
    alert('Add model feature - connect to your custom model importer');
  };

  /**
   * 分享功能
   * 将体素数据复制到剪贴板
   */
  const handleShare = () => {
    if (engineRef.current) {
      const jsonData = engineRef.current.getJsonData();
      navigator.clipboard.writeText(jsonData).then(() => {
        alert('Voxel data copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy. Try manually copying from the JSON export.');
      });
    }
  };

  /**
   * 处理生成请求
   * @param prompt 用户输入的提示词
   * @param params 高级参数设置
   */
  const handleSubmit = async (prompt: string, params: AdvancedParams) => {
    setError(undefined);
    setGenerationMetadata(undefined);
    setTemplateMatch(undefined);
    setIsGenerating(true);

    try {
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      let voxels: VoxelData[] = [];

      // 根据风格参数选择不同的生成器
      switch (params.style) {
        case 'realistic':
          voxels = Generators.Eagle();
          break;
        case 'cartoon':
          voxels = Generators.Cat();
          break;
        case 'abstract':
          voxels = Generators.Rabbit();
          break;
        default:
          voxels = Generators.Eagle();
      }

      // 随机调整颜色
      if (voxels.length > 0) {
        voxels = voxels.map(v => ({
          ...v,
          color: (v.color + Math.floor(Math.random() * 0x222222)) & 0xFFFFFF
        }));
      }

      // 加载生成的模型
      if (engineRef.current) {
        engineRef.current.loadInitialModel(voxels);
      }

      // 计算并显示元数据
      const metadata = calculateMetadata(voxels);
      setGenerationMetadata(metadata);

      // 模拟模板匹配结果
      const isTemplateMatch = Math.random() > 0.5;
      if (isTemplateMatch) {
        setTemplateMatch({
          matched: true,
          templateName: 'Eagle',
          confidence: 0.85 + Math.random() * 0.1,
          templateInfo: 'Closely matches the Eagle template with natural coloring'
        });
      }
    } catch (err) {
      console.error('Generation failed', err);
      setError('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 重试生成
   */
  const handleRetry = () => {
    setError(undefined);
  };

  /**
   * 关闭错误提示
   */
  const handleDismissError = () => {
    setError(undefined);
  };

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden">
      {/* 3D渲染容器 */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* 模式选择界面 */}
      {appMode === null && (
        <ModeSelection onSelect={setAppMode} />
      )}

      {/* 主应用界面 */}
      {appMode !== null && (
        <>
          {/* 欢迎屏幕 */}
          <WelcomeScreen visible={showWelcome} />

          {/* 顶部导航栏 */}
          <TopBar
            appMode={appMode}
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
            onAddModel={handleAddModel}
            isAutoRotate={isAutoRotate}
            onToggleRotate={handleToggleRotate}
            onShare={handleShare}
            voxelCount={voxelCount}
            currentParams={currentParams}
          />

          {/* 状态面板（显示生成结果和错误） */}
          <StatusPanel
            metadata={generationMetadata}
            templateMatch={templateMatch}
            error={error}
            onRetry={handleRetry}
            onDismissError={handleDismissError}
          />

          {/* 底部面板（输入框和参数设置） */}
          <BottomPanel
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
            onParamsChange={setCurrentParams}
            showAdvanced={appMode === 'expert'}
          />
        </>
      )}
    </div>
  );
};

export default App;