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
 * Main application component
 * Manages the state and logic of the entire voxel toy box application
 */
const App: React.FC = () => {
  // Container reference for rendering 3D scene
  const containerRef = useRef<HTMLDivElement>(null);
  // Voxel engine reference for manipulating 3D models
  const engineRef = useRef<VoxelEngine | null>(null);

  // Application state management
  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PresetModel>('Eagle');

  // Generation result related states
  const [generationMetadata, setGenerationMetadata] = useState<GenerationMetadata | undefined>();
  const [templateMatch, setTemplateMatch] = useState<TemplateMatchResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  
  // 3D view controls
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  
  // Advanced parameter settings
  const [currentParams, setCurrentParams] = useState<AdvancedParams>({
    style: 'realistic',
    colorScheme: 'vibrant',
    size: 'medium',
    symmetry: 'none'
  });
  
  // Application mode (quick/expert)
  const [appMode, setAppMode] = useState<AppMode | null>(null);

  /**
   * Initialize on component mount
   * - Create Voxel engine instance
   * - Load initial model
   * - Listen for window size changes
   * - Auto hide welcome screen
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
   * Calculate generation result metadata
   * @param voxels Voxel data array
   * @returns Generation metadata object
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
   * Handle model change
   * @param model Selected preset model
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
   * Toggle auto-rotate state
   */
  const handleToggleRotate = () => {
    const newState = !isAutoRotate;
    setIsAutoRotate(newState);
    if (engineRef.current) {
      engineRef.current.setAutoRotate(newState);
    }
  };

  /**
   * Add model feature (reserved interface)
   */
  const handleAddModel = () => {
    alert('Add model feature - connect to your custom model importer');
  };

  /**
   * Share functionality
   * Copy voxel data to clipboard
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
   * Handle generation request
   * @param prompt User input prompt
   * @param params Advanced parameter settings
   */
  const handleSubmit = async (prompt: string, params: AdvancedParams) => {
    setError(undefined);
    setGenerationMetadata(undefined);
    setTemplateMatch(undefined);
    setIsGenerating(true);

    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      let voxels: VoxelData[] = [];

      // Select different generator based on style parameter
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

      // Randomly adjust colors
      if (voxels.length > 0) {
        voxels = voxels.map(v => ({
          ...v,
          color: (v.color + Math.floor(Math.random() * 0x222222)) & 0xFFFFFF
        }));
      }

      // Load generated model
      if (engineRef.current) {
        engineRef.current.loadInitialModel(voxels);
      }

      // Calculate and display metadata
      const metadata = calculateMetadata(voxels);
      setGenerationMetadata(metadata);

      // Simulate template matching result
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
   * Retry generation
   */
  const handleRetry = () => {
    setError(undefined);
  };

  /**
   * Dismiss error message
   */
  const handleDismissError = () => {
    setError(undefined);
  };
//Chen Yanzi
  /**
   * Return to home page
   */
  const handleHome = () => {
    setAppMode(null);
    setShowWelcome(false);
    setIsGenerating(false);
    setError(undefined);
  };

  /**
   * Dismantle model
   */
  const handleDismantle = () => {
    engineRef.current?.dismantle();
  };

  /**
   * Rebuild model
   */
  const handleRebuild = () => {
    const generator = Generators[selectedModel];
    if (generator) {
      const modelData = generator();
      engineRef.current?.rebuild(modelData);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden">
      {/* 3D rendering container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Mode selection interface */}
      {appMode === null && (
        <ModeSelection onSelect={setAppMode} />
      )}

      {/* Main application interface */}
      {appMode !== null && (
        <>
          {/* Welcome screen */}
          <WelcomeScreen visible={showWelcome} />

          {/* Top navigation bar */}
          <TopBar
            appMode={appMode}
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
            onAddModel={handleAddModel}
            isAutoRotate={isAutoRotate}
            onToggleRotate={handleToggleRotate}
            onShare={handleShare}
            onHome={handleHome}
            onDismantle={handleDismantle}
            onRebuild={handleRebuild}
            voxelCount={voxelCount}
            currentParams={currentParams}
          />

          {/* Status panel (shows generation results and errors) */}
          <StatusPanel
            metadata={generationMetadata}
            templateMatch={templateMatch}
            error={error}
            onRetry={handleRetry}
            onDismissError={handleDismissError}
          />

          {/* Bottom panel (input box and parameter settings) */}
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
