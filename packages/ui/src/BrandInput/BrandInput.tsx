import { Tag, Package } from 'lucide-react';

export interface BrandInputProps {
  brandName: string;
  productName: string;
  onBrandChange: (v: string) => void;
  onProductChange: (v: string) => void;
}

export function BrandInput({ brandName, productName, onBrandChange, onProductChange }: BrandInputProps) {
  return (
    <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Tag size={20} className="text-gray-500" />
          </div>
          <div>
            <h2 className="text-[1rem] font-bold text-gray-800">저장 정보</h2>
            <p className="text-xs text-gray-400 mt-0.5">히스토리 저장 및 파일명에 사용됩니다</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={brandName}
              onChange={(e) => onBrandChange(e.target.value)}
              placeholder="브랜드명 (예: NIKE)"
              className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all"
            />
          </div>
          <div className="relative">
            <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productName}
              onChange={(e) => onProductChange(e.target.value)}
              placeholder="상품명 (예: AIR-MAX-90)"
              className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
