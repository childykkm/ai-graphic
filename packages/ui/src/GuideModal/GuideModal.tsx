
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Info } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const GUIDE_MENUS = [
  { id: 'all', title: '설명서 개요', badge: '가이드' },
  { id: 'graphic', title: '1. Graphic (화보)', badge: '룩북' },
  { id: 'concept', title: '2. Concept (배경)', badge: '컨셉' },
  { id: 'floor', title: '3. Floor (바닥컷)', badge: '상세' },
  { id: 'model', title: '4. Model (피사체)', badge: '동일' },
  { id: 'variation', title: '5. Variation (변주)', badge: '제어' },
];

export function GuideModal({ isOpen, onClose, activeTab, onTabChange }: GuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl border border-gray-150 flex flex-col my-8 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-[#1A1A1A] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-white w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-extrabold tracking-tight">AI 그래픽 생성기 임직원 사용 가이드</h3>
                  <p className="text-xs text-gray-300 font-medium mt-0.5">효율적인 이커머스 패션 컨텐츠 가공 및 마케팅 이미지 제작 매뉴얼</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/15 transition-colors text-gray-300 hover:text-white">
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 text-left">
                <span className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">가이드 메뉴</span>
                {GUIDE_MENUS.map((menu) => {
                  const isSelected = activeTab === menu.id;
                  return (
                    <button
                      key={menu.id}
                      onClick={() => onTabChange(menu.id)}
                      className={`flex items-center md:justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
                        isSelected ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-650 hover:text-gray-900 hover:bg-gray-150'
                      }`}
                    >
                      <span>{menu.title}</span>
                      <span className={`hidden md:inline text-[9px] px-2 py-0.5 rounded-full font-extrabold ml-2 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {menu.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto text-left leading-relaxed">
                {activeTab === 'all' && (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 mt-1">
                        <Info size={22} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-orange-950">환영합니다! AI 그래픽 프로세서 사용 안내</h4>
                        <p className="text-sm text-orange-900/80 font-medium mt-1">
                          본 프로그램은 고해상도 이미지 AI 생성 엔진을 도입하여, 단품 사진만으로도 고품질 패션 브랜드 룩북, 배경, 고정 바닥컷, 동일 인물 가공 및 자유로운 구도의 이미지 변주를 가능하게 설계한 임직원 전용 원클릭 그래픽 툴입니다.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-black text-gray-900">🚀 핵심 가동 3단계 프로세스</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { stage: 'STAGE 01', color: 'text-blue-600', title: '기능 탭 선별', desc: '제작하고자 하는 목적물(화보, 배경, 상세컷 등)에 맞추어 상단의 5대 기능 중 하나를 선택합니다.' },
                          { stage: 'STAGE 02', color: 'text-purple-600', title: '소스 및 스펙 설정', desc: '정/후면 의류 컷, 모델 초안, 혹은 레퍼런스 이미지를 드래그 앤 드롭하고 슬라이더 옵션을 세팅합니다.' },
                          { stage: 'STAGE 03', color: 'text-emerald-600', title: '생성 및 일괄 다운로드', desc: '생성 수량을 지정하여 AI 연산을 실행하고, 완성된 고화질 결과물을 ZIP 파일로 일괄 내려받습니다.' },
                        ].map((s) => (
                          <div key={s.stage} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                            <span className={`text-xs font-bold ${s.color} block mb-1`}>{s.stage}</span>
                            <h5 className="text-sm font-bold text-gray-800">{s.title}</h5>
                            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* API Key 섹션 - apps/graphic은 서버에서 키 관리하므로 비활성화
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Key size={14} /> 안전한 API Key 연결 프로세스</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        시스템을 활용하기 위해 AI Studio Secrets 환경 데이터에 등록되어 있는 API 키를 사용하거나, 키가 활성화되어 있지 않은 경우 우측 상단의 <strong className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">API 키 선택</strong> 버튼을 클릭해 키를 간편하게 연동해 주시면 정상 가동됩니다.
                      </p>
                    </div>
                    */}
                  </div>
                )}

                {activeTab === 'graphic' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-[#1A1A1A] px-2.5 py-1 rounded-md">기능 1</span>
                      <h4 className="text-lg font-black text-gray-900">Graphic (상품 통합 모델 화보 컷)</h4>
                    </div>
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase">목적 및 요약</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">단일 의류 등 상품 원본 컷(정면, 후면, 세부 원단 디테일, 또는 코디에 필요한 타 의류 부자재 등)과 모델 예시 데이터를 다중 합성·렌더링하여, 해당 옷을 그대로 착용한 브랜드 룩북 및 마케팅 광고용 명품 화보 컷을 생성합니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">📥 필수 첨부 자원</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>상품 정면/후면 이미지 (최대 2장)</strong>: 옷의 실루엣과 컬러, 핏을 대조하기 위한 의류 단독 컷.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>디테일 이미지 (최대 10장)</strong>: 주머니, 지퍼, 자수, 가죽패치 등 정교하게 노출할 디테일 스냅 컷.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>기타 착장 이미지 (선택)</strong>: 아우터 생성 시 함께 매치할 바지나 신발 등의 협조성 제품 이미지.</div></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">⚙️ 맞춤 제어 파라미터 및 노하우</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-purple-500">●</span><div><strong>한 장에 포함할 이미지 수</strong>: 1 선택 시 단일 고화질 모델 컷, 2개 이상 선택 시 콜라주 격자 형태로 분할 레이아웃됩니다.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-purple-500">●</span><div><strong>시선/자세/시점 강도 조절</strong>: 구도를 유지하려면 1~3, 역동적인 룩북을 원하면 7~9를 세팅하세요.</div></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'concept' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-[#1A1A1A] px-2.5 py-1 rounded-md">기능 2</span>
                      <h4 className="text-lg font-black text-gray-900">Concept (무드 분석 입체 배경)</h4>
                    </div>
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase">목적 및 요약</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">촬영하고 싶은 실내외 스튜디오, 자연경관, 모던 주택 등 원본 레퍼런스 이미지의 전체적인 빛의 방향, 감도, 조명 톤앤매너를 분석하여 완벽하게 결을 같이 하는 유사 입체 컨셉 배경을 창조해 냅니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">📥 필수 첨부 자원</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>레퍼런스 이미지 (최대 5장)</strong>: 영감을 제공할 색감, 분위기, 공간의 특징이 찍힌 무드보드 혹은 실제 촬영장 시안 이미지.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>오브젝트 이미지 (선택)</strong>: 배경 한가운데에 배치하고 싶은 가구, 조각, 소품 등 단독 아이템 이미지.</div></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">⚙️ 권장 작동 시나리오</h5>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          - 상품 입점 마케팅 소스로 쓸 깨끗한 공배경이 필요할 때 활용합니다.<br />
                          - "해질녘의 부드러운 오렌지색 자연광이 비스듬히 비치는 모던 스튜디오 콘크리트 벽면 배경" 등의 구체적인 문장을 기본 요청 사항에 추가하면 훨씬 밀도 높은 공간이 렌더링됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'floor' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-[#1A1A1A] px-2.5 py-1 rounded-md">기능 3</span>
                      <h4 className="text-lg font-black text-gray-900">Floor (깔끔한 무왜곡 바닥컷)</h4>
                    </div>
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase">목적 및 요약</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">종합 쇼핑몰 및 이커머스 상품 설명서에 필수적으로 첨부되어야 하는 깔끔한 바닥컷을 다림질한 것처럼 평평하고 완벽한 각도와 세부 마킹을 보존해 대량 고화질로 렌더링합니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">📥 구성 세부 드롭 슬롯</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>정면 / 후면 (각 최대 2장)</strong>: 전반적인 실루엣 파악용.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>브랜드 로고 마크 (최대 2장)</strong>: 프린팅이나 라벨, 패치 등의 선명함 유지.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>원단/봉제선 디테일 (최대 10장)</strong>: 미세한 스티치나 직조 구조 유지용.</div></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">⚙️ 연출 조건 스타일</h5>
                        <ul className="text-xs text-gray-600 space-y-3 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-purple-500">●</span><div><strong>옷걸이컷 (Hanger Style)</strong>: 목재 또는 스틸 옷걸이에 자연스럽게 걸린 입체 구도.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-purple-500">●</span><div><strong>접힌 바닥컷 (Folded Style)</strong>: 칼같이 주름을 잡아 개어놓은 고급 컷.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-purple-500">●</span><div><strong>펼쳐진 바닥컷 (Spread Style)</strong>: 구김살 없이 바닥에 플랫하게 펼쳐놓은 기본 구도.</div></li>
                          <li className="flex items-start gap-1.5"><span className="text-emerald-500">●</span><div><strong>배경 색상 지정</strong>: 사내 가이드라인에 맞춘 HEX 컬러 단색 배경 지정 가능.</div></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'model' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-[#1A1A1A] px-2.5 py-1 rounded-md">기능 4</span>
                      <h4 className="text-lg font-black text-gray-900">Model (스튜디오 전방위 동일 인물 모델 컷)</h4>
                    </div>
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase">목적 및 요약</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">제출한 고정 모델의 얼굴 형상, 이목구비, 헤어스타일, 바디 비율 등을 고유하게 유지하면서 [클로즈업 / 전신 핏 / 90도 프로필 측면 / 후면] 총 4가지 필수 전 구도의 화보를 완벽하게 패키지로 출력합니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">📥 필수 첨부 자원</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>레퍼런스 모델 예시 사진 (최대 5장)</strong>: 통일된 특정 인물의 마스크, 피부 색조가 담긴 사진.</div></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">⚙️ 자동화 4대 구도 상세 규격</h5>
                        <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside font-medium">
                          <li><strong>얼굴 확대샷</strong>: 눈빛, 피부 질감, 표정 등이 밀도 있게 표현되는 컷.</li>
                          <li><strong>전신샷</strong>: 머리부터 발끝까지 전체 비율을 나타내는 대표 샷.</li>
                          <li><strong>측면샷</strong>: 의상의 숄더 라인 및 허리선 드레이프를 볼 수 있는 프로필 측면 사진.</li>
                          <li><strong>후면샷</strong>: 의상 백 포켓이나 절개 장식, 후드 등의 디자인을 강조하는 후면 뷰.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'variation' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white bg-[#1A1A1A] px-2.5 py-1 rounded-md">기능 5</span>
                      <h4 className="text-lg font-black text-gray-900">Variation (정밀 수치 제어 극적 변주)</h4>
                    </div>
                    <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase">목적 및 요약</span>
                      <p className="text-sm font-medium text-gray-700 mt-1">원본 광고 이미지 한 장을 올려두고, 원본 패션 아이템의 고유 특성은 지키되, 모델의 [시선(Gaze)], [자세(Pose)], [카메라 앵글(Camera View)]을 슬라이더 수치(0~9)로 통제하여 매 번 중복되지 않는 독보적인 2차 변형 화보 생산 라인을 확립할 수 있습니다.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">📥 필수 첨부 자원</h5>
                        <ul className="text-xs text-gray-600 space-y-2 font-medium">
                          <li className="flex items-start gap-1.5"><span className="text-blue-500">●</span><div><strong>AI 변주용 원본 사진 (최대 5장)</strong>: 변형 및 가공을 가하고 싶은 기준 패션 모델 컷, 호리존 화보 또는 룩북 사진.</div></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-gray-800 mb-2">⚙️ 3종 변밀 제어 가이드</h5>
                        <ul className="text-xs text-gray-600 space-y-3 font-medium">
                          <li><strong className="text-[#1A1A1A]">시선 강도 (1~9단계)</strong><br />- 1~3: 원본 응시 유지.<br />- 7~9: 완전히 반대 방향 또는 사선의 매력적인 시선으로 강제 렌더링.</li>
                          <li><strong className="text-[#1A1A1A]">자세 강도 (1~9단계)</strong><br />- 1~3: 정면 자세, 팔 위치 등 원본 자세 유지.<br />- 7~9: 양 손 활용, 의자에 걸터앉은 쪼그림, 역동적으로 보행하는 파격 변형.</li>
                          <li><strong className="text-[#1A1A1A]">시점 강도 (1~9단계)</strong><br />- 1~3: 수평 촬영 시점 고정.<br />- 7~9: 탑 다운 뷰(조감도), 바닥에 밀착해 위를 쳐다보는 하이앤 로우 앵글 연출.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
              <span className="text-xs font-semibold text-gray-500">※ 생성된 모든 초상권/상업적 이용 가이드는 가속 생성된 결과 파일 zip을 통해 즉시 확인 가능합니다.</span>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold hover:bg-gray-800 transition-colors shrink-0"
              >
                가이드 닫고 돌아가기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
