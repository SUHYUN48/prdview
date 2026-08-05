import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, X, Minus, Copy, Check, Sparkles, RefreshCcw, ArrowRight, BookOpen, Undo2, Redo2, History, Clock, Trash2 } from 'lucide-react';
import { ChangeLogItem } from '../types';

interface MarkdownEditorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onChangeMarkdown: (newVal: string) => void;
  summaryText: string;
  changeLogs: ChangeLogItem[];
  onClearLogs: () => void;
  onCommitLog?: () => void;
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
  changeLogs,
  onClearLogs,
  onCommitLog,
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

  const lastCursorPosRef = useRef<number | null>(null);

  const handleCursorOrBlurCheck = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lastCursorPosRef.current !== null && lastCursorPosRef.current !== target.selectionStart) {
      // 커서 위치 이동이 일어난 경우 지금까지의 수정을 1개의 변경 로그로 커밋
      onCommitLog?.();
    }
    lastCursorPosRef.current = target.selectionStart;
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
            onClick={() => {
              onCommitLog?.();
              setActiveTab('editor');
            }}
            className={`px-3 py-1.5 font-bold rounded-t-[4px] border-t border-x transition-all ${
              activeTab === 'editor'
                ? 'bg-white border-[#E5E7EB] border-b-white text-[#111827]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            마크다운 작성/수정
          </button>
          <button
            onClick={() => {
              onCommitLog?.();
              setActiveTab('briefing');
            }}
            className={`px-3 py-1.5 font-bold rounded-t-[4px] border-t border-x transition-all flex items-center gap-1.5 ${
              activeTab === 'briefing'
                ? 'bg-white border-[#E5E7EB] border-b-white text-[#111827]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <History size={13} className="text-[#3B82F6]" />
            <span>변경 로그 ({changeLogs.length})</span>
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
            onBlur={() => onCommitLog?.()}
            onClick={handleCursorOrBlurCheck}
            onKeyUp={handleCursorOrBlurCheck}
            placeholder="마크다운 PRD를 입력하거나 수정하세요... (예: ├─ QuoteCard)"
            className="flex-1 w-full p-3 font-mono text-[13px] leading-relaxed text-[#1F2937] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:bg-white resize-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* 변경 로그 탭 본문 */}
      {activeTab === 'briefing' && (
        <div className="flex-1 p-4 bg-[#F9FAFB] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <h4 className="font-bold text-[14px] text-[#111827] flex items-center gap-1.5">
              <History size={15} className="text-[#3B82F6]" />
              <span>PRD 변경 이력 (Change Log)</span>
            </h4>
            {changeLogs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-[11px] font-medium text-[#6B7280] hover:text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>로그 초기화</span>
              </button>
            )}
          </div>

          {changeLogs.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] space-y-2">
              <Clock size={28} className="mx-auto text-[#D1D5DB]" />
              <p className="text-[13px] font-semibold text-[#4B5563]">아직 감지된 변경 로그가 없습니다.</p>
              <p className="text-[11px]">마크다운을 수정하면 변경 내역이 시간 순으로 로그로 기록됩니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeLogs.map((log, idx) => (
                <div key={log.id} className="p-3.5 bg-white border border-[#E5E7EB] rounded-[6px] shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-1.5">
                    <span className="text-[11px] font-bold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock size={11} />
                      {log.timestamp}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono font-semibold">#{changeLogs.length - idx}</span>
                  </div>

                  {/* 라인 단위 상세 변경내역 (몇줄 / before: 원래 내용 / after: 변경 내용) */}
                  {log.lineChanges && log.lineChanges.length > 0 && (
                    <div className="space-y-2">
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {log.lineChanges.slice(0, 20).map((change, i) => (
                          <div key={i} className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-[11px] space-y-1">
                            <div className="font-bold text-[#2563EB] flex items-center justify-between text-[10px]">
                              <span>{change.lineNo}번째 줄</span>
                              <span className={`px-1 py-0.2 rounded font-semibold uppercase ${
                                change.type === 'added' ? 'bg-[#DCFCE7] text-[#15803D]' :
                                change.type === 'removed' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                                'bg-[#FEF3C7] text-[#B45309]'
                              }`}>
                                {change.type === 'added' ? '추가됨' : change.type === 'removed' ? '삭제됨' : '수정됨'}
                              </span>
                            </div>

                            {change.type !== 'added' && (
                              <div className="text-[#991B1B] bg-[#FEF2F2] px-2 py-1 rounded whitespace-pre-wrap border border-[#FCA5A5]/40 leading-snug break-all">
                                <span className="font-bold select-none text-[#7F1D1D] mr-1">before:</span>
                                {change.before || '(빈 줄)'}
                              </div>
                            )}

                            {change.type !== 'removed' && (
                              <div className="text-[#166534] bg-[#F0FDF4] px-2 py-1 rounded whitespace-pre-wrap border border-[#86EFAC]/40 leading-snug break-all">
                                <span className="font-bold select-none text-[#14532D] mr-1">after: </span>
                                {change.after || '(빈 줄)'}
                              </div>
                            )}
                          </div>
                        ))}
                        {log.lineChanges.length > 20 && (
                          <div className="text-[10px] text-center text-[#6B7280] py-1">
                            ...외 {log.lineChanges.length - 20}개 줄 변경 생략
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AI 브리핑 카드 */}
          <div className="pt-3 border-t border-[#E5E7EB]">
            <button
              onClick={onRequestAiBriefing}
              disabled={isAiLoading}
              className="w-full py-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#3B82F6] rounded-[6px] text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            >
              <Sparkles size={14} className={isAiLoading ? 'animate-spin' : ''} />
              <span>{isAiLoading ? 'AI 브리핑 분석 중...' : 'AI 변경사항 요약받기 (Gemini)'}</span>
            </button>
            {aiBriefingText && (
              <div className="mt-3 p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] space-y-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#1E40AF] font-bold text-[12px]">
                  <Sparkles size={14} />
                  <span>AI 분석 결과</span>
                </div>
                <div className="text-[12px] leading-relaxed text-[#1E3A8A] whitespace-pre-wrap">
                  {aiBriefingText}
                </div>
              </div>
            )}
          </div>
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

