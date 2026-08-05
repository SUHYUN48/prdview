import React from 'react';
import { X, Sparkles, Check, Copy, RefreshCw, FileText, Layout } from 'lucide-react';
import { DiffResult } from '../types';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffResult: DiffResult;
  aiBriefingText: string | null;
  isAiLoading: boolean;
  onRequestAiBriefing: () => void;
  onCopyMarkdown: () => void;
  isCopied: boolean;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  onClose,
  diffResult,
  aiBriefingText,
  isAiLoading,
  onRequestAiBriefing,
  onCopyMarkdown,
  isCopied
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#000000] w-full max-w-2xl max-h-[85vh] rounded-[2px] shadow-2xl flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="bg-[#000000] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#ff4800]" />
            <h3 className="font-bold text-[16px] tracking-tight">PRD 변경 사항 요약 브리핑 (Briefing)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#aaaaaa] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 자동 감지 구조 요약 */}
          <div className="bg-[#fafafa] border border-[#dddddd] p-4 rounded-[2px] space-y-3">
            <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
              <span className="text-[12px] font-bold text-[#000000] uppercase tracking-wider flex items-center gap-1.5">
                <Layout size={14} className="text-[#000000]" />
                구조 및 와이어프레임 차이점 분석
              </span>
              <span className="text-[11px] font-mono text-[#5d5d5d]">
                {diffResult.hasChanges ? '변경사항 감지됨' : '변경사항 없음'}
              </span>
            </div>

            <div className="text-[14px] leading-relaxed text-[#303033] whitespace-pre-wrap font-sans">
              {diffResult.summaryText}
            </div>
          </div>

          {/* AI 브리핑 카드 */}
          <div className="bg-[#fff8f6] border border-[#ffdcd2] p-5 rounded-[2px] space-y-3">
            <div className="flex items-center justify-between border-b border-[#fcd5ce] pb-2">
              <div className="flex items-center gap-2 text-[#ff4800] font-bold text-[14px]">
                <Sparkles size={16} />
                <span>AI 기획 보조 분석 (Gemini 2.5)</span>
              </div>
              <button
                onClick={onRequestAiBriefing}
                disabled={isAiLoading}
                className="px-3 py-1 text-[11px] font-bold text-white bg-[#ff4800] hover:bg-[#e03e00] rounded-[2px] transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={12} className={isAiLoading ? 'animate-spin' : ''} />
                <span>{isAiLoading ? '분석 중...' : 'AI 브리핑 생성'}</span>
              </button>
            </div>

            {isAiLoading ? (
              <div className="p-6 text-center text-[13px] text-[#ff4800] space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-[#ff4800]" />
                <p className="font-bold">Gemini AI가 변경된 PRD 기획을 분석 중입니다...</p>
                <p className="text-[12px] text-[#5d5d5d]">수정 전/후의 와이어프레임 및 기획 의도 시사점을 요약합니다.</p>
              </div>
            ) : aiBriefingText ? (
              <div className="text-[13px] leading-relaxed text-[#303033] whitespace-pre-wrap font-sans bg-white p-3.5 border border-[#ffe0d6] rounded-[2px]">
                {aiBriefingText}
              </div>
            ) : (
              <p className="text-[12px] text-[#5d5d5d] py-2">
                [AI 브리핑 생성] 버튼을 누르면 Gemini AI가 변경된 PRD의 기획 의도와 개발 시 주의점을 브리핑해 드립니다.
              </p>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 bg-[#f0f0f0] border-t border-[#dddddd] flex items-center justify-between">
          <button
            onClick={onCopyMarkdown}
            className="px-4 py-2 bg-[#000000] text-white text-[13px] font-bold rounded-[2px] hover:bg-[#222222] transition-all flex items-center gap-1.5"
          >
            {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span>{isCopied ? '클립보드 복사 완료' : '수정된 PRD 복사 (AI 전달용)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-[#000000] border border-[#dddddd] text-[13px] font-bold rounded-[2px] hover:bg-[#f5f5f5] transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
