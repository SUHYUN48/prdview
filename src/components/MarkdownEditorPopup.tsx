import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, X, Minus, Copy, Check, Sparkles, RefreshCcw, ArrowRight, BookOpen, Undo2, Redo2 } from 'lucide-react';

interface MarkdownEditorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onChangeMarkdown: (newVal: string) => void;
  summaryText: string;
  onCopyMarkdown: () => void;
  isCopied: boolean;
  onRequestAiBriefing: () => void;
  isAiLoading: boolean;
  aiBriefingText: string | null;
}

export const MarkdownEditorPopup: React.FC<MarkdownEditorPopupProps> = ({
  isOpen,
  onClose,
  markdown,
  onChangeMarkdown,
  summaryText,
  onCopyMarkdown,
  isCopied,
  onRequestAiBriefing,
  isAiLoading,
  aiBriefingText
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'briefing'>('editor');

  // 마크다운 수정 히스토리 (Undo / Redo 기능)
  const [history, setHistory] = useState<string[]>([markdown]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isInternalUpdateRef = useRef<boolean>(false);

  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    if (history[historyIndex] !== markdown) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(markdown);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [markdown]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      isInternalUpdateRef.current = true;
      setHistoryIndex(prevIndex);
      onChangeMarkdown(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      isInternalUpdateRef.current = true;
      setHistoryIndex(nextIndex);
      onChangeMarkdown(history[nextIndex]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  const lineCount = markdown.split('\n').length;
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  // 패널이 접혀있는 경우 슬림한 세로 토글 바 표시
  if (!isOpen) {
    return (
      <aside
        onClick={onClose}
        className="w-10 shrink-0 border-l border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col items-center py-4 cursor-pointer transition-colors z-20 group"
        title="마크다운 에디터 펼치기"
      >
        <div className="p-1.5 bg-[#111827] text-white rounded-[4px] group-hover:scale-105 transition-transform mb-6">
          <FileEdit size={16} />
        </div>
        <div className="writing-mode-vertical text-[12px] font-bold text-[#4B5563] tracking-widest uppercase flex items-center gap-2 select-none">
          <span>PRD EDITOR</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-[440px] lg:w-[480px] shrink-0 border-l border-[#E5E7EB] bg-white sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col z-20 shadow-xs transition-all duration-300">
      {/* 고정 사이드 패널 헤더 */}
      <div className="bg-[#111827] text-white p-3.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <FileEdit size={16} className="text-[#3B82F6]" />
          <span className="font-bold text-[14px] tracking-tight">PRD Markdown Editor</span>
          <span className="text-[11px] text-[#9CA3AF] font-mono">
            ({lineCount}줄 / {wordCount}단어)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] rounded transition-colors cursor-pointer"
            title="패널 접기"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 pt-2 text-[13px] shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 font-bold rounded-t-[4px] border-t border-x transition-all ${
              activeTab === 'editor'
                ? 'bg-white border-[#E5E7EB] border-b-white text-[#111827]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            마크다운 작성/수정
          </button>
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 font-bold rounded-t-[4px] border-t border-x transition-all flex items-center gap-1.5 ${
              activeTab === 'briefing'
                ? 'bg-white border-[#E5E7EB] border-b-white text-[#111827]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Sparkles size={13} className="text-[#3B82F6]" />
            <span>변경사항 브리핑</span>
          </button>
        </div>

        <div className="pb-1">
          <button
            onClick={onCopyMarkdown}
            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-[4px] transition-all flex items-center gap-1 cursor-pointer"
            title="AI 에이전트 전달용 클립보드 복사"
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            <span>{isCopied ? '복사완료' : '마크다운 복사'}</span>
          </button>
        </div>
      </div>

      {/* 에디터 탭 본문 */}
      {activeTab === 'editor' && (
        <div className="flex-1 p-3 flex flex-col bg-white overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <p className="text-[11px] text-[#6B7280] flex items-center gap-1">
              <BookOpen size={12} className="text-[#3B82F6]" />
              <span>
                마크다운 수정 시 와이어프레임 <strong>실시간 동기화</strong>
              </span>
            </p>

            {/* 실행 취소(Undo) / 다시 실행(Redo) 버튼 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium text-[#4B5563] bg-[#F9FAFB] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E5E7EB] transition-all flex items-center gap-1 cursor-pointer"
                title="실행 취소 (Undo) - Ctrl+Z"
              >
                <Undo2 size={12} />
                <span>뒤로가기</span>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium text-[#4B5563] bg-[#F9FAFB] hover:text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed border border-[#E5E7EB] transition-all flex items-center gap-1 cursor-pointer"
                title="다시 실행 (Redo) - Ctrl+Y"
              >
                <Redo2 size={12} />
                <span>되돌리기</span>
              </button>
            </div>
          </div>

          <textarea
            value={markdown}
            onChange={(e) => onChangeMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="마크다운 PRD를 입력하거나 수정하세요... (예: ├─ QuoteCard)"
            className="flex-1 w-full p-3 font-mono text-[13px] leading-relaxed text-[#1F2937] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:bg-white resize-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* 변경사항 브리핑 탭 본문 */}
      {activeTab === 'briefing' && (
        <div className="flex-1 p-4 bg-[#F9FAFB] overflow-y-auto space-y-4">
          <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-[6px] space-y-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <h4 className="font-bold text-[14px] text-[#111827] flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#3B82F6]" />
                자동 감지된 변경사항 요약
              </h4>
              <button
                onClick={onRequestAiBriefing}
                disabled={isAiLoading}
                className="text-[11px] font-medium text-[#3B82F6] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCcw size={12} className={isAiLoading ? 'animate-spin' : ''} />
                <span>AI 브리핑 재생성</span>
              </button>
            </div>

            <div className="text-[13px] leading-relaxed text-[#374151] whitespace-pre-wrap font-sans">
              {summaryText || '변경 감지 중...'}
            </div>
          </div>

          {/* AI 브리핑 카드 */}
          {aiBriefingText && (
            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-[13px]">
                <Sparkles size={16} />
                <span>AI 기획 보조 브리핑 (Gemini)</span>
              </div>
              <div className="text-[13px] leading-relaxed text-[#1E40AF] whitespace-pre-wrap">
                {aiBriefingText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 패널 푸터 */}
      <div className="p-2.5 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280] shrink-0">
        <span>💡 1인 기획자용 AI 에이전트(Cursor, Windsurf) 호환 규격</span>
        <button
          onClick={onCopyMarkdown}
          className="font-bold text-[#3B82F6] hover:underline cursor-pointer"
        >
          [최종 PRD 복사하기]
        </button>
      </div>
    </aside>
  );
};
