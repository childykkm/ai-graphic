import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, DownloadCloud, BookOpen } from 'lucide-react';
import { PasswordModal } from '../PasswordModal/PasswordModal';
import { ErrorModal } from '../ErrorModal/ErrorModal';
import { ResultsGallery } from '../ResultsGallery/ResultsGallery';
import { GuideModal } from '../GuideModal/GuideModal';
import { FullscreenViewer } from '../FullscreenViewer/FullscreenViewer';
import type { AspectRatio, ActiveTab, GeneratedImage } from '@repo/core';
import { downloadSingle, downloadZip } from '@repo/core';

const NAV_ITEMS: { tab: ActiveTab; label: string }[] = [
  { tab: 'graphic', label: 'Graphic' },
  { tab: 'concept', label: 'Concept' },
  { tab: 'floor', label: 'Floor' },
  { tab: 'model', label: 'Model' },
  { tab: 'variation', label: 'Variation' },
];

interface PageShellProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  showPwdModal: boolean;
  setShowPwdModal: (v: boolean) => void;
  showErrorModal: boolean;
  setShowErrorModal: (v: boolean) => void;
  selectedFullscreen: string | null;
  setSelectedFullscreen: (v: string | null) => void;
  authenticated: boolean;
  verify: (pwd: string) => Promise<{ success: boolean; message: string }>;
  onConfirmPassword: () => void;
  results: GeneratedImage[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
  count: number;
  aspectRatio: AspectRatio;
  children: ReactNode;
}

export function PageShell({
  activeTab,
  onNavigate,
  showPwdModal, setShowPwdModal,
  showErrorModal, setShowErrorModal,
  selectedFullscreen, setSelectedFullscreen,
  authenticated, verify, onConfirmPassword,
  results, isGenerating, progress, error,
  count, aspectRatio,
  children,
}: PageShellProps) {
  const [headerRight, setHeaderRight] = useState<Element | null>(null);
  const [headerRightMobile, setHeaderRightMobile] = useState<Element | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('all');

  useEffect(() => {
    setHeaderRight(document.getElementById('header-right'));
    setHeaderRightMobile(document.getElementById('header-right-mobile'));
  }, [results.length, authenticated]);

  const downloadAll = async () => {
    const prefix =
      activeTab === 'floor' ? 'floor_shot_' :
      activeTab === 'concept' ? 'concept_shot_' :
      activeTab === 'model' ? 'model_shot_' :
      activeTab === 'variation' ? 'variation_shot_' :
      'graphic_shot_';
    const zipName =
      activeTab === 'floor' ? 'floor_shots.zip' :
      activeTab === 'concept' ? 'concept_shots.zip' :
      activeTab === 'model' ? 'model_shots.zip' :
      activeTab === 'variation' ? 'variation_shots.zip' :
      'graphic_shots.zip';
    await downloadZip(results, zipName, (i) => `${prefix}${i + 1}.png`);
  };

  const headerActions = (
    <>
      {authenticated && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
          <Check size={12} /> 인증됨
        </div>
      )}
      {results.length > 0 && (
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-md shadow-black/10"
        >
          <DownloadCloud size={15} /> 전체 다운로드
        </button>
      )}
    </>
  );

  return (
    <div className="pb-24 selection:bg-orange-100">
      {/* 헤더 right slot에 액션 버튼 포탈 (desktop) */}
      {headerRight && createPortal(headerActions, headerRight)}
      {/* 헤더 right slot에 액션 버튼 포탈 (mobile) */}
      {headerRightMobile && createPortal(headerActions, headerRightMobile)}

      <PasswordModal
        open={showPwdModal}
        onClose={() => setShowPwdModal(false)}
        onConfirm={async (pwd) => {
          const result = await verify(pwd);
          if (result.success) { setShowPwdModal(false); onConfirmPassword(); }
          return result;
        }}
      />

      <ErrorModal open={showErrorModal} error={error} onClose={() => setShowErrorModal(false)} />

      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        activeTab={activeGuideTab}
        onTabChange={setActiveGuideTab}
      />

      <FullscreenViewer src={selectedFullscreen} onClose={() => setSelectedFullscreen(null)} />

      {/* Main layout */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-4 flex flex-col gap-6 relative pb-32 xl:pb-0">
          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-5">
              {NAV_ITEMS.map(({ tab, label }) => (
                <button
                  key={tab}
                  onClick={() => onNavigate(tab)}
                  className={`flex flex-col items-center justify-center py-3 text-xs font-bold transition-all border-b-2 ${
                    activeTab === tab
                      ? 'text-[#1A1A1A] border-[#1A1A1A] bg-gray-50'
                      : 'text-gray-400 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="px-3 py-2.5 border-t border-gray-100">
              <button
                onClick={() => setShowGuideModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200"
              >
                <BookOpen size={13} />
                임직원 사용 가이드
              </button>
            </div>
          </div>

          {children}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-8 flex flex-col">
          <ResultsGallery
            results={results} isGenerating={isGenerating} progress={progress}
            count={count} aspectRatio={aspectRatio} activeTab={activeTab}
            onFullscreen={setSelectedFullscreen} onDownloadSingle={downloadSingle}
          />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; border: 2px solid #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
    </div>
  );
}
