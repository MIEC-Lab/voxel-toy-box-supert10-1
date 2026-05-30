#Hujialuo
  
import React from 'react';
import { Bird, Cat, Rabbit, Users, ChevronDown, Plus } from 'lucide-react';

export type PresetModel = 'Eagle' | 'Cat' | 'Rabbit' | 'Twins';

interface ModelSelectorProps {
  selectedModel: PresetModel;
  onSelect: (model: PresetModel) => void;
  onAdd?: () => void;
}

const MODEL_INFO: { [key in PresetModel]: { icon: React.ReactNode; label: string; color: string } } = {
  Eagle: { icon: <Bird size={16} />, label: 'Eagle', color: 'text-amber-600' },
  Cat: { icon: <Cat size={16} />, label: 'Cat', color: 'text-orange-600' },
  Rabbit: { icon: <Rabbit size={16} />, label: 'Rabbit', color: 'text-pink-600' },
  Twins: { icon: <Users size={16} />, label: 'Twins', color: 'text-emerald-600' }
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect, onAdd }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const info = MODEL_INFO[selectedModel];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition-all font-medium text-slate-700"
      >
        <span className={info.color}>{info.icon}</span>
        <span>{info.label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-white border-2 border-indigo-200 rounded-xl overflow-hidden shadow-lg z-20 min-w-[140px]">
          {(Object.keys(MODEL_INFO) as PresetModel[]).map((model) => {
            const modelData = MODEL_INFO[model];
            return (
              <button
                key={model}
                onClick={() => {
                  onSelect(model);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-indigo-50 transition-colors font-medium ${
                  model === selectedModel ? 'bg-indigo-100' : 'text-slate-700'
                }`}
              >
                <span className={modelData.color}>{modelData.icon}</span>
                <span>{modelData.label}</span>
              </button>
            );
          })}

          {onAdd && (
            <>
              <div className="h-px bg-slate-100" />
              <button
                onClick={() => {
                  onAdd();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-indigo-50 transition-colors font-medium text-indigo-600"
              >
                <Plus size={16} />
                <span>Add Model</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
