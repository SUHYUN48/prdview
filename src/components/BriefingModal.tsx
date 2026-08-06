import React, { useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
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
  // 모달이 열릴 때 자동으로 브리핑 생성을 요청
  useEffect(() => {
    if (isOpen && !aiBriefingText && !isAiLoading) {
      onRequestAiBriefing();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-[#111827] w-full max-w-xl max-h-[85vh] rounded-[8px] shadow-2xl flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="bg-[#111827] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#3B82F6]" />
            <h3 className="font-bold text-[16px] tracking-tight">PRD 변경 사항 요약</h3>
          </div>
        </div>

        {/* 모달 본문 - 단일 영역으로 변경 요약 표시 */}
        <div className="p-6 overflow-y-auto flex-1 select-text">
          {isAiLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw size={28} className="animate-spin mx-auto text-[#3B82F6]" />
              <p className="font-bold text-[15px] text-[#111827]">PRD 변경 사항을 요약 분석 중입니다...</p>
              <p className="text-[12px] text-[#6B7280]">와이어프레임 구조 및 기획 변경점을 정리하고 있습니다.</p>
            </div>
          ) : aiBriefingText ? (
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-5 rounded-[6px] text-[14px] leading-relaxed text-[#1F2937] whitespace-pre-wrap font-sans">
              {aiBriefingText}
            </div>
          ) : (
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-5 rounded-[6px] text-[14px] text-[#6B7280] text-center">
              요약할 변경 사항이 없습니다.
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-end shrink-0 select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#111827] text-white text-[13px] font-bold rounded-[6px] hover:bg-[#1F2937] transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
