import React, { useState } from 'react';
import { PromptInput } from './PromptInput';
import { AdvancedParametersPanel, AdvancedParams } from './AdvancedParametersPanel';
import { GenerationResultMeta } from './GenerationResultMeta';
import { TemplateMatchResultDisplay } from './TemplateMatchResultDisplay';
import { GenerationError } from './ErrorDisplay';
import { StatusBar } from './StatusBar';
import { GenerationMetadata, TemplateMatchResult, VoxelData } from '../types';
import { ModelSelector, PresetModel } from './ModelSelector';
import { Loader2 } from 'lucide-react';

interface MVPPageProps {
  onGenerate: (prompt: string, params: AdvancedParams) => Promise<{
    voxels: VoxelData[];
    metadata: GenerationMetadata;
    templateMatch: TemplateMatchResult;
  }>;
  onVoxelsGenerated?: (voxels: VoxelData[]) => void;
  onRequestVoxels?: () => Promise<VoxelData[]>;
  selectedModel?: PresetModel;
  onModelChange?: (model: PresetModel) => void;
  onAddModel?: () => void;
}

export const MVPPage: React.FC<MVPPageProps> = ({ onGenerate, onVoxelsGenerated, onRequestVoxels, selectedModel = 'Eagle', onModelChange, onAddModel }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    voxels: VoxelData[];
    metadata: GenerationMetadata;
    templateMatch: TemplateMatchResult;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [advancedParams, setAdvancedParams] = useState<AdvancedParams>({
    style: 'realistic',
    colorScheme: 'vibrant',
    size: 'medium',
    symmetry: 'none'
  });

  const handleSubmit = async (prompt: string) => {
    setError(null);
    setIsGenerating(true);

    try {
      const result = await onGenerate(prompt, advancedParams);
      setLastResult({
        voxels: result.voxels,
        metadata: result.metadata,
        templateMatch: result.templateMatch
      });
      if (onVoxelsGenerated) {
        onVoxelsGenerated(result.voxels);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed, please try again';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const handleCopy = async () => {
    try {
      let voxelsToCopy: VoxelData[];
      if (lastResult?.voxels && lastResult.voxels.length > 0) {
        voxelsToCopy = lastResult.voxels;
      } else if (onRequestVoxels) {
        voxelsToCopy = await onRequestVoxels();
      } else {
        return;
      }
      const json = JSON.stringify(voxelsToCopy, null, 2);
      await navigator.clipboard.writeText(json);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <StatusBar
        params={advancedParams}
        voxelCount={lastResult?.metadata.voxelCount || 0}
        onCopy={handleCopy}
        isCopied={isCopied}
      />

      <div className="flex flex-col h-full">
        <div className="flex-1 relative" />

        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-4 max-w-2xl mx-auto">
          {lastResult && !isGenerating && !error && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 space-y-3">
              <GenerationResultMeta metadata={lastResult.metadata} />
              <TemplateMatchResultDisplay result={lastResult.templateMatch} />
            </div>
          )}

          {error && !isGenerating && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
              <GenerationError
                error={error}
                onRetry={handleRetry}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {isGenerating && (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 size={24} className="text-indigo-500 animate-spin" />
                <span className="text-slate-600 font-medium">Generating voxel model...</span>
              </div>
            </div>
          )}

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <ModelSelector
                selectedModel={selectedModel}
                onSelect={onModelChange || (() => {})}
                onAdd={onAddModel}
              />
              <PromptInput
                onSubmit={handleSubmit}
                isGenerating={isGenerating}
              />
            </div>

            <AdvancedParametersPanel
              params={advancedParams}
              onChange={setAdvancedParams}
              isExpanded={advancedExpanded}
              onToggle={() => setAdvancedExpanded(!advancedExpanded)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MVPPage;