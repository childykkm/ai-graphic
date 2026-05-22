import { useRef } from 'react';
import { Pipette } from 'lucide-react';

const BG_COLORS = [
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB',
  '#FCA5A5', '#FCD34D', '#86EFAC', '#9A3412', '#3B82F6', '#1E3A8A',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCustomColor = !BG_COLORS.map((c) => c.toUpperCase()).includes(value.toUpperCase());

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {BG_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-10 h-10 rounded-full border-2 transition-transform ${
            value.toUpperCase() === color.toUpperCase()
              ? 'border-[#1A1A1A] scale-110 shadow-md'
              : 'border-gray-200 hover:scale-105'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <div className="relative w-10 h-10">
        <button
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 ${
            isCustomColor
              ? 'border-[#1A1A1A] scale-110 shadow-md'
              : 'border-dashed border-gray-300 hover:border-gray-500 bg-white'
          }`}
          style={isCustomColor ? { backgroundColor: value } : {}}
          onClick={() => inputRef.current?.click()}
          title="직접 색상 선택"
        >
          <Pipette
            size={14}
            className={isCustomColor ? 'text-white drop-shadow' : 'text-gray-400'}
          />
        </button>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
        />
      </div>
    </div>
  );
}
