import React from 'react';
import { SamplePRDOption } from '../types';
import { Layers, FileEdit, Sparkles, Copy, Check, Eye, HelpCircle, RefreshCw } from 'lucide-react';

interface TopHeaderProps {
  appTitle: string;
  samplePrds: SamplePRDOption[];
  activeSampleId: string;
  onSelectSample: (sampleId: string) => void;
  highlightDiff: boolean;
  onToggleHighlightDiff: () => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  onCopyMarkdown: () => void;
  isCopied: boolean;
  onOpenBriefingModal: () => void;
  onResetToSample: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appTitle,
  samplePrds,
  activeSampleId,
  onSelectSample,
  highlightDiff,
  onToggleHighlightDiff,
  isEditorOpen,
  onToggleEditor,
  onCopyMarkdown,
  isCopied,
  onOpenBriefingModal,
  onResetToSample
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

        {/* 템플릿 셀렉터 */}
        <div className="hidden md:flex items-center gap-2 border-l border-[#E5E7EB] pl-4 ml-2">
          <span className="text-[11px] text-[#6B7280] font-medium">예시 PRD:</span>
          <select
            value={activeSampleId}
            onChange={(e) => onSelectSample(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2937] text-[12px] font-medium border border-[#E5E7EB] rounded-[4px] px-2.5 py-1 focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
          >
            {samplePrds.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.badge}] {s.title}
              </option>
            ))}
          </select>
          <button
            onClick={onResetToSample}
            className="p-1 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            title="현재 PRD 원본으로 되돌리기"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 우측 컨트롤 바 */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Diff 하이라이트 토글 */}
        <button
          onClick={onToggleHighlightDiff}
          className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
            highlightDiff
              ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
              : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]'
          }`}
          title="변경 사항 시각적 하이라이트(Visual Diff) 켜기/끄기"
        >
          <Eye size={14} />
          <span className="hidden sm:inline">Visual Diff</span>
          <span className="text-[10px] uppercase font-bold px-1 py-0.2 bg-white/20 rounded">
            {highlightDiff ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* AI 변경 사항 브리핑 버튼 */}
        <button
          onClick={onOpenBriefingModal}
          className="px-3 py-1.5 rounded-[6px] text-[12px] font-semibold bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all flex items-center gap-1.5 cursor-pointer"
          title="PRD 변경 사항 요약 브리핑 보기"
        >
          <Sparkles size={14} className="text-[#3B82F6]" />
          <span className="hidden sm:inline">AI Briefing</span>
        </button>

        {/* 마크다운 복사하기 (AI 에이전트 전달용) */}
        <button
          onClick={onCopyMarkdown}
          className="px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          title="AI 코딩 에이전에 전달할 마크다운 복사"
        >
          {isCopied ? (
            <>
              <Check size={14} />
              <span>복사완료!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="hidden sm:inline">Copy Markdown for AI</span>
            </>
          )}
        </button>

        {/* 마크다운 에디터 토글 버튼 */}
        <button
          onClick={onToggleEditor}
          className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
            isEditorOpen
              ? 'bg-[#111827] text-white border-[#111827]'
              : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
          }`}
        >
          <FileEdit size={14} />
          <span>Editor</span>
        </button>
      </div>
    </header>
  );
};
