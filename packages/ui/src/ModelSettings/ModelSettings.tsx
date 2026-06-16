export interface ModelSettingsValue {
  gender: string;
  ageGroup: string;
  height: string;
  bodyType: string;
}

interface ModelSettingsProps {
  value: ModelSettingsValue;
  onChange: (v: ModelSettingsValue) => void;
}

const GENDER_OPTIONS = ['여성', '남성'];
const AGE_GROUP_OPTIONS = ['10대', '20대', '30대'];
const HEIGHT_OPTIONS = ['150cm', '155cm', '160cm', '165cm', '170cm', '175cm'];
const BODY_TYPE_OPTIONS = ['슬림', '보통', '풍성한'];

export function ModelSettings({ value, onChange }: ModelSettingsProps) {
  const set = (key: keyof ModelSettingsValue) => (v: string) =>
    onChange({ ...value, [key]: value[key] === v ? '' : v });

  return (
    <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
      <p className="text-sm font-bold text-gray-700">모델 설정 <span className="text-gray-400 font-medium">(선택)</span></p>

      {/* 성별 */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">성별</p>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => set('gender')(opt)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${value.gender === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 나이대 */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">나이대</p>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUP_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => set('ageGroup')(opt)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${value.ageGroup === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 키 */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">키</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {HEIGHT_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => set('height')(opt)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${value.height === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text" value={HEIGHT_OPTIONS.includes(value.height) ? '' : value.height}
          onChange={(e) => onChange({ ...value, height: e.target.value })}
          placeholder="직접 입력 (예: 148cm, 182cm)"
          className="w-full p-3.5 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
        />
      </div>

      {/* 체형 */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">체형</p>
        <div className="flex gap-2">
          {BODY_TYPE_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => set('bodyType')(opt)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${value.bodyType === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
