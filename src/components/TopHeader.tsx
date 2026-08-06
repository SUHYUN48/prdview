import React from 'react';
import { Layers, Sparkles, Eye, RefreshCw, Copy, Check } from 'lucide-react';

interface TopHeaderProps {
  appTitle: string;
  isEditorOpen?: boolean;
  onToggleEditor?: () => void;
  onOpenBriefingModal: () => void;
  onCopySampleMarkdown: () => void;
  isSampleCopied: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appTitle,
  isEditorOpen,
  onToggleEditor,
  onOpenBriefingModal,
  onCopySampleMarkdown,
  isSampleCopied
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-white text-[#1F2937] border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between shadow-xs select-none">
      {/* 브랜드 로고 및 서브타이틀 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#3B82F6] text-white flex items-center justify-center font-black rounded-[4px] tracking-widest text-[14px]">
            PV
          </div>
          <div>
            <h1 className="text-[17px] md:text-[18px] font-extrabold tracking-tight text-[#3B82F6] flex items-center gap-2">
              PRDView
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE] rounded-[4px]">
                High Density Visualizer
              </span>
            </h1>
          </div>
        </div>

        {/* 샘플 복사 버튼 */}
        <div className="hidden md:flex items-center gap-2 border-l border-[#E5E7EB] pl-4 ml-2">
          <button
            onClick={onCopySampleMarkdown}
            className={`px-2.5 py-1 text-[11px] font-bold border rounded-[4px] transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
              isSampleCopied 
                ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' 
                : 'bg-white hover:bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]'
            }`}
            title="대표 예시 PRD 마크다운 클립보드에 복사"
          >
            {isSampleCopied ? <Check size={12} /> : <Copy size={12} />}
            <span>{isSampleCopied ? '복사 완료!' : '샘플 복사'}</span>
          </button>
        </div>
      </div>

      {/* 우측 컨트롤 바 */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* AI 변경 사항 브리핑 버튼 */}
        <button
          onClick={onOpenBriefingModal}
          className="px-3 py-1.5 rounded-[6px] text-[12px] font-semibold bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all flex items-center gap-1.5 cursor-pointer"
          title="PRD 변경 사항 요약 브리핑 보기"
        >
          <Sparkles size={14} className="text-[#3B82F6]" />
          <span className="hidden sm:inline">AI 요약</span>
        </button>


      </div>
    </header>
  );
};
