import React from 'react';
import { ScreenSection } from '../types';
import { WireframeNode } from './WireframeNode';
import { AppWindow, AlertTriangle, CheckSquare, StickyNote } from 'lucide-react';

interface ScreenCardProps {
  screen: ScreenSection;
  highlightDiff?: boolean;
  isRoot?: boolean;
}

export const ScreenCard: React.FC<ScreenCardProps> = ({ screen, highlightDiff = true, isRoot = true }) => {
  const isAdded = highlightDiff && screen.diffStatus === 'added';
  const isModified = highlightDiff && screen.diffStatus === 'modified';
  const level = screen.level || 2;

  const badges = (
    <>
      {isAdded && (
        <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#10B981] rounded-full tracking-wider shrink-0 font-mono">
          NEW
        </span>
      )}
      {isModified && (
        <span className="px-2 py-0.5 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] border border-[#10B981] rounded-full shrink-0 font-mono">
          MODIFIED
        </span>
      )}
    </>
  );

  const body = (
    <>
      {/* 와이어프레임 컴포넌트 트리 (실제 UI 구조) */}
      {screen.nodes.length > 0 && (
        <div className="space-y-2">
          {screen.nodes.map((node) => (
            <WireframeNode key={node.id} node={node} highlightDiff={highlightDiff} />
          ))}
        </div>
      )}

      {/* 문단/불릿/표 등 참고용 텍스트 (와이어프레임 박스와 다른 스타일의 메모 카드) */}
      {screen.contentItems.length > 0 && (
        <div>{renderContentItems(screen.contentItems)}</div>
      )}

      {/* 하위 섹션(##, ###)들은 같은 화면 프레임 안에 계속 이어서 중첩 렌더링 */}
      {screen.children && screen.children.length > 0 && (
        <div className="space-y-5">
          {screen.children.map((child) => (
            <ScreenCard key={child.id} screen={child} highlightDiff={highlightDiff} isRoot={false} />
          ))}
        </div>
      )}
    </>
  );

  // 최상위(#) 화면 = 캔버스 위의 아트보드 프레임 (경계/배경이 있는 실제 "화면" 단위)
  if (isRoot) {
    return (
      <section
        id={screen.id}
        className={`scroll-mt-20 mb-8 rounded-[10px] border-2 bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${
          isAdded ? 'border-[#10B981]' : isModified ? 'border-[#6EE7B7]' : 'border-[#CBD5E1]'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <AppWindow size={15} className="text-[#94A3B8] shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] font-mono shrink-0">
            Screen
          </span>
          <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A] tracking-tight truncate min-w-0">
            {screen.title}
          </h2>
          {badges}
        </div>
        <div className="p-5 space-y-5">{body}</div>
      </section>
    );
  }

  // 하위(##/###) 섹션 = 프레임이 아니라 화면 안의 얇은 구분선 + 폰트 크기로만 구분 (노션 스타일)
  let headingStyle = 'text-[16px] md:text-[17px] font-bold text-[#334155]';
  if (level >= 4) {
    headingStyle = 'text-[13px] md:text-[14px] font-semibold text-[#475569]';
  }

  return (
    <section id={screen.id} className="scroll-mt-20 space-y-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#EEF2F6]">
        <span className="w-1 h-3.5 rounded-full bg-[#CBD5E1] shrink-0" />
        <h3 className={`${headingStyle} tracking-tight truncate min-w-0`}>{screen.title}</h3>
        {badges}
      </div>
      <div className="pl-3.5 space-y-4">{body}</div>
    </section>
  );
};

// 마크다운 굵은 글씨 (**bold**) 서식 변환 헬퍼
function renderFormattedText(text: string | undefined): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-[#0F172A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// 텍스트/표/코드 요소 렌더링 헬퍼 (폭 제한 없이 오른쪽 끝까지 시원하게 채움)
function renderContentItems(contentItems: ScreenSection['contentItems']) {
  return (
    <div className="space-y-2.5 w-full">
      {contentItems.map((item) => {
        if (item.type === 'paragraph') {
          return (
            <p
              key={item.id}
              className="text-[14px] leading-relaxed text-[#374151] py-1 w-full"
            >
              {renderFormattedText(item.text)}
            </p>
          );
        }

        if (item.type === 'bullet') {
          return (
            <div
              key={item.id}
              className="flex items-start gap-2 text-[14px] leading-relaxed text-[#374151] py-1 w-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0 mt-2" />
              <span className="w-full">{renderFormattedText(item.text)}</span>
            </div>
          );
        }

        if (item.type === 'table' && item.table) {
          return (
            <div key={item.id} className="overflow-x-auto border border-dashed border-[#CBD5E1] rounded-[4px]">
              <table className="w-full text-left text-[13px] border-collapse font-mono">
                <thead>
                  <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB]">
                    {item.table.headers.map((h, idx) => (
                      <th key={idx} className="p-2.5 font-bold text-[#1F2937] border-r border-[#E5E7EB] last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-[#4B5563] border-r border-[#E5E7EB] last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (item.type === 'code') {
          return (
            <div key={item.id} className="bg-[#111827] text-[#F9FAFB] p-3.5 rounded-[4px] font-mono text-[12px] overflow-x-auto border border-dashed border-[#374151]">
              <pre>{item.text}</pre>
            </div>
          );
        }

        if (item.type === 'fallback') {
          return (
            <div key={item.id} className="bg-[#FFFBEB] border border-dashed border-[#FDE68A] p-4 rounded-[4px] space-y-2">
              <div className="flex items-center gap-2 text-[#D97706] font-bold text-[13px] font-mono">
                <AlertTriangle size={16} />
                <span>Fallback preserved text</span>
              </div>
              <pre className="text-[12px] text-[#92400E] font-mono whitespace-pre-wrap bg-white p-2.5 border border-[#FDE68A] rounded-[4px]">
                {item.text}
              </pre>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
