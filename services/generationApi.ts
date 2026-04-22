// 所有导入统一放在文件顶部（正确语法）
import type { BackendGenerationResponse, GenerationOptions } from '../../../types';
import { VoxelData } from '../../../types';
import './endpoints/api';

// 系统提示语（唯一定义，无重复）
const DEFAULT_SYSTEM_CONTEXT = [
  'You are a creative voxel art generator.',
  'Always return valid JSON only.',
  'Keep the result centered, connected, and visually readable.',
].join(' ');

// 核心生成函数
export async function generateVoxelModel(
  prompt: string,
  options: GenerationOptions,
  mode: 'fast' | 'expert'
): Promise<BackendGenerationResponse & { voxels: VoxelData[] }> {
  const response = await api<BackendGenerationResponse>('lego-gemini', {
    method: 'POST',
    body: JSON.stringify({
      systemContext: DEFAULT_SYSTEM_CONTEXT,
      prompt,
      mode,
      options,
    }),
  });

  if (!response.success || !response.voxels) {
    throw new Error(response.error || 'Backend generation failed.');
  }

  return response as BackendGenerationResponse & { voxels: VoxelData[] };
}

// 备用生成函数
export async function generateVoxelData(options: GenerationOptions): Promise<VoxelData> {
  return {} as VoxelData;
}
