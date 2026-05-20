import { Package } from 'lucide-react';

export const BRAND_LIST = [
  'OUTDOORPRODUCTS',
  'UNIVERSALOVERALL',
  'ORDINARYHOLIDAY',
  'ELLESSE',
  'HIRO',
  'GLGK',
  'SANN',
] as const;

export type BrandName = typeof BRAND_LIST[number] | '';

export interface BrandInputProps {
  brandName: BrandName;
  productName: string;
  onBrandChange: (v: BrandName) => void;
  onProductChange: (v: string) => void;
}

export function BrandInput({ brandName, productName, onBrandChange, onProductChange }: BrandInputProps) {
  return (
    <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            <Package size={20} className="text-gray-500" />
          </div>
          <div>
            <h2 className="text-[1rem] font-bold text-gray-800">저장 정보</h2>
            <p className="text-xs text-gray-400 mt-0.5">히스토리 저장 및 파일명에 사용됩니다</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* 브랜드 선택 */}
          <div className="relative">
            <select
              value={brandName}
              onChange={(e) => onBrandChange(e.target.value as BrandName)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all appearance-none cursor-pointer text-gray-700"
            >
              <option value="">브랜드 선택</option>
              {BRAND_LIST.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {/* 드롭다운 화살표 */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5L7 9L11 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 상품명 입력 */}
          <div className="relative">
            <input
              type="text"
              value={productName}
              onChange={(e) => onProductChange(e.target.value)}
              placeholder="상품명 입력 (예: ODP123)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#1A1A1A] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
