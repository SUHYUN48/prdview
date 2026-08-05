import React from 'react';
import { ScreenSection } from '../types';
import { ListTree, Layout, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface TocSidebarProps {
  screens: ScreenSection[];
  activeScreenId: string | null;
  onSelectScreen: (screenId: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const TocSidebar: React.FC<TocSidebarProps> = ({
  screens,
  activeScreenId,
  onSelectScreen,
  isOpen,
  onToggleOpen
}) => {
  return (
    <aside
      className={`fixed lg:sticky top-14 left-0 z-20 h-[calc(100vh-3.5rem)] bg-white border-r border-[#E5E7EB] transition-all duration-200 flex flex-col shrink-0 select-none ${isOpen ? 'w-60' : 'w-12'
        }`}
    >
      {/* 헤더 및 토글 버튼 */}
      <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
        {isOpen && (
          <div className="flex items-center gap-2 text-[#9CA3AF] font-bold text-[11px] uppercase tracking-wider">
            <ListTree size={14} className="text-[#3B82F6]" />
            <span>Contents</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-[#F3F4F6] text-[#4B5563] rounded">
              {screens.length}
            </span>
          </div>
        )}
        <button
          onClick={onToggleOpen}
          className="p-1 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded transition-colors ml-auto cursor-pointer"
          title={isOpen ? '목차 닫기' : '목차 열기'}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* 목차 리스트 */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {screens.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-[#9CA3AF]">
              목차가 없습니다.
            </div>
          ) : (
            screens.map((s, index) => {
              const isActive = activeScreenId === s.id;
              const isAdded = s.diffStatus === 'added';
              const isModified = s.diffStatus === 'modified';
              const level = s.level || 2;

              // 헤딩 레벨 (#, ##, ###)에 따른 노션 스타일 들여쓰기(Padding)
              let indentClass = 'pl-4';
              if (level === 2) indentClass = 'pl-6';
              if (level >= 3) indentClass = 'pl-9';

              return (
                <button
                  key={s.id}
                  onClick={() => onSelectScreen(s.id)}
                  className={`w-full text-left py-2 pr-3 border-l-3 transition-all flex items-center justify-between group cursor-pointer ${indentClass} ${isActive
                      ? 'bg-[#EFF6FF] text-[#3B82F6] border-l-[#3B82F6] font-bold'
                      : 'text-[#4B5563] border-l-transparent hover:bg-[#F9FAFB] hover:text-[#111827]'
                    }`}
                >
                  <div className="flex items-center min-w-0 pr-1">
                    <span className="text-[13px] truncate tracking-tight">{s.title}</span>
                  </div>

                  {/* 변경 상태 표시 도트/배지 */}
                  {isAdded && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold text-white bg-[#10B981] rounded-full shrink-0">
                      NEW
                    </span>
                  )}
                  {isModified && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold text-[#10B981] bg-[#ECFDF5] border border-[#10B981] rounded-full shrink-0">
                      MOD
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      ) : (
        /* 축소 모드 가로 아이콘 리스트 */
        <div className="flex-1 overflow-y-auto p-1 space-y-2 flex flex-col items-center pt-3">
          {screens.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                onToggleOpen();
                onSelectScreen(s.id);
              }}
              className={`w-8 h-8 rounded flex items-center justify-center text-[11px] font-mono transition-all relative cursor-pointer ${activeScreenId === s.id
                  ? 'bg-[#3B82F6] text-white font-bold'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              title={s.title}
            >
              {idx + 1}
              {(s.diffStatus === 'added' || s.diffStatus === 'modified') && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981]" />
              )}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
