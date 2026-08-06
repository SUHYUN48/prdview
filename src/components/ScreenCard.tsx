import React, { useState, useRef, useEffect } from 'react';
import { ScreenSection } from '../types';
import { WireframeNode } from './WireframeNode';
import { AppWindow, AlertTriangle, Pencil } from 'lucide-react';

interface ScreenCardProps {
  screen: ScreenSection;
  isRoot?: boolean;
  onCanvasEdit?: (rawSection: string, oldText: string, newText: string) => void;
}

// ── 인라인 편집 가능한 단일 텍스트 컴포넌트 ──────────────────────────────────
interface EditableTextProps {
  value: string;
  onCommit: (oldVal: string, newVal: string) => void;
  className?: string;
  multiline?: boolean;
  tag?: 'span' | 'div' | 'h2' | 'h3' | 'p' | 'td' | 'th';
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onCommit,
  className = '',
  multiline = false,
  tag: Tag = 'span',
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // value가 외부에서 바뀌면 draft도 동기화 (마크다운 에디터 → 캔버스 방향)
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onCommit(value, trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  if (editing) {
    const sharedProps = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKeyDown,
      autoFocus: true,
      className: `bg-[#EFF6FF] border border-[#3B82F6] rounded px-1 outline-none w-full text-[#1F2937] ${className}`,
    };

    return multiline ? (
      <textarea {...sharedProps} rows={3} style={{ resize: 'vertical' }} />
    ) : (
      <input {...sharedProps} type="text" />
    );
  }

  return (
    <Tag
      className={`relative group cursor-text ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={startEdit}
      title="클릭하여 편집"
    >
      {value}
      {hovered && (
        <span className="inline-flex items-center ml-1.5 align-middle opacity-50 hover:opacity-100 transition-opacity">
          <Pencil size={11} className="text-[#3B82F6]" />
        </span>
      )}
    </Tag>
  );
};

// ── 마크다운 굵은 글씨 서식 변환 헬퍼 ──────────────────────────────────────
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

// ── contentItems 렌더링 (편집 가능) ─────────────────────────────────────────
function renderContentItems(
  contentItems: ScreenSection['contentItems'],
  rawSection: string,
  onCanvasEdit?: ScreenCardProps['onCanvasEdit']
) {
  const edit = (oldText: string, newText: string) => {
    onCanvasEdit?.(rawSection, oldText, newText);
  };

  return (
    <div className="space-y-2.5 w-full">
      {contentItems.map((item) => {
        if (item.type === 'paragraph') {
          return (
            <div key={item.id} className="text-[14px] leading-relaxed text-[#374151] py-1 w-full">
              {onCanvasEdit ? (
                <EditableText
                  value={item.text ?? ''}
                  onCommit={(o, n) => edit(o, n)}
                  className="text-[14px] leading-relaxed text-[#374151]"
                  multiline
                  tag="p"
                />
              ) : (
                <p>{renderFormattedText(item.text)}</p>
              )}
            </div>
          );
        }

        if (item.type === 'bullet') {
          return (
            <div
              key={item.id}
              className="flex items-start gap-2 text-[14px] leading-relaxed text-[#374151] py-1 w-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] shrink-0 mt-2" />
              {onCanvasEdit ? (
                <EditableText
                  value={item.text ?? ''}
                  onCommit={(o, n) => {
                    // 마크다운에서 bullet은 "- 텍스트" 형태이므로 텍스트 부분만 교체
                    edit(o, n);
                  }}
                  className="text-[14px] leading-relaxed text-[#374151] w-full"
                  tag="span"
                />
              ) : (
                <span className="w-full">{renderFormattedText(item.text)}</span>
              )}
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
                        {onCanvasEdit ? (
                          <EditableText
                            value={h}
                            onCommit={(o, n) => edit(o, n)}
                            tag="span"
                          />
                        ) : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F9FAFB]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-[#4B5563] border-r border-[#E5E7EB] last:border-r-0">
                          {onCanvasEdit ? (
                            <EditableText
                              value={cell}
                              onCommit={(o, n) => edit(o, n)}
                              tag="span"
                            />
                          ) : cell}
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
              {onCanvasEdit ? (
                <EditableText
                  value={item.text ?? ''}
                  onCommit={(o, n) => edit(o, n)}
                  multiline
                  className="bg-transparent text-[#F9FAFB] font-mono text-[12px] w-full border-[#4B5563]"
                  tag="div"
                />
              ) : (
                <pre>{item.text}</pre>
              )}
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

// ── ScreenCard 메인 컴포넌트 ─────────────────────────────────────────────────
export const ScreenCard: React.FC<ScreenCardProps> = ({
  screen,
  isRoot = true,
  onCanvasEdit,
}) => {
  const level = screen.level || 2;

  // 제목 편집: 마크다운 헤더 줄 ("## 제목") 에서 제목 부분만 교체
  const handleTitleEdit = (oldTitle: string, newTitle: string) => {
    const hashes = '#'.repeat(screen.level);
    onCanvasEdit?.(screen.rawMarkdown, `${hashes} ${oldTitle}`, `${hashes} ${newTitle}`);
  };

  const body = (
    <>
      {screen.nodes.length > 0 && (
        <div className="space-y-2">
          {screen.nodes.map((node) => (
            <WireframeNode
              key={node.id}
              node={node}
              rawSection={screen.rawMarkdown}
              onCanvasEdit={onCanvasEdit}
            />
          ))}
        </div>
      )}

      {screen.contentItems.length > 0 && (
        <div>{renderContentItems(screen.contentItems, screen.rawMarkdown, onCanvasEdit)}</div>
      )}

      {screen.children && screen.children.length > 0 && (
        <div className="space-y-5">
          {screen.children.map((child) => (
            <ScreenCard
              key={child.id}
              screen={child}
              isRoot={false}
              onCanvasEdit={onCanvasEdit}
            />
          ))}
        </div>
      )}
    </>
  );

  if (isRoot) {
    return (
      <section
        id={screen.id}
        className={`scroll-mt-20 mb-8 rounded-[10px] border-2 bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)] border-[#CBD5E1]`}
      >
        <div className="flex items-center gap-2.5 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <AppWindow size={15} className="text-[#94A3B8] shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] font-mono shrink-0">
            Screen
          </span>
          {onCanvasEdit ? (
            <EditableText
              value={screen.title}
              onCommit={handleTitleEdit}
              className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A] tracking-tight min-w-0"
              tag="h2"
            />
          ) : (
            <h2 className="text-[18px] md:text-[20px] font-extrabold text-[#0F172A] tracking-tight truncate min-w-0">
              {screen.title}
            </h2>
          )}
        </div>
        <div className="p-5 space-y-5">{body}</div>
      </section>
    );
  }

  let headingStyle = 'text-[16px] md:text-[17px] font-bold text-[#334155]';
  if (level >= 4) {
    headingStyle = 'text-[13px] md:text-[14px] font-semibold text-[#475569]';
  }

  return (
    <section id={screen.id} className="scroll-mt-20 space-y-3">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#EEF2F6]">
        <span className="w-1 h-3.5 rounded-full bg-[#CBD5E1] shrink-0" />
        {onCanvasEdit ? (
          <EditableText
            value={screen.title}
            onCommit={handleTitleEdit}
            className={`${headingStyle} tracking-tight min-w-0`}
            tag="h3"
          />
        ) : (
          <h3 className={`${headingStyle} tracking-tight truncate min-w-0`}>{screen.title}</h3>
        )}
      </div>
      <div className="pl-3.5 space-y-4">{body}</div>
    </section>
  );
};
