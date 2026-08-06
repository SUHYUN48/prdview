import React, { useState, useRef, useEffect } from 'react';
import { WireframeNodeData } from '../types';
import {
  Code, Zap, ChevronRight, ChevronDown, MousePointerClick,
  TextCursorInput, AppWindow, PanelTop, CreditCard, Table,
  ListFilter, Image as ImageIcon, Box, Pencil
} from 'lucide-react';

interface WireframeNodeProps {
  node: WireframeNodeData;
  depth?: number;
  /** 이 노드가 속한 섹션의 rawMarkdown (교체 범위 한정용) */
  rawSection?: string;
  onCanvasEdit?: (rawSection: string, oldText: string, newText: string) => void;
}

// ── 인라인 편집 가능한 텍스트 (단일 라인) ──────────────────────────────────
interface EditableInlineProps {
  value: string;
  onCommit: (oldVal: string, newVal: string) => void;
  className?: string;
}

const EditableInline: React.FC<EditableInlineProps> = ({ value, onCommit, className = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onCommit(value, trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={`bg-[#EFF6FF] border border-[#3B82F6] rounded px-1 outline-none ${className}`}
        style={{ minWidth: 60 }}
      />
    );
  }

  return (
    <span
      className={`cursor-text group relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setEditing(true)}
      title="클릭하여 편집"
    >
      {value}
      {hovered && (
        <span className="inline-flex items-center ml-1 opacity-50 hover:opacity-100 transition-opacity align-middle">
          <Pencil size={10} className="text-[#3B82F6]" />
        </span>
      )}
    </span>
  );
};

// ── 컴포넌트 이름 기반 UI 타입 자동 감지 ───────────────────────────────────
function getComponentUiInfo(name: string) {
  const lower = name.toLowerCase();
  if (/button|btn|action|submit|click/i.test(lower))
    return { icon: MousePointerClick, label: 'Button', color: 'text-[#3B82F6] bg-[#EFF6FF] border-[#BFDBFE]' };
  if (/input|search|text|field|form|edit/i.test(lower))
    return { icon: TextCursorInput, label: 'Input Field', color: 'text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]' };
  if (/modal|popup|dialog|overlay/i.test(lower))
    return { icon: AppWindow, label: 'Modal/Popup', color: 'text-[#8B5CF6] bg-[#F5F3FF] border-[#DDD6FE]' };
  if (/header|nav|top|bar|menu/i.test(lower))
    return { icon: PanelTop, label: 'Header/Nav', color: 'text-[#F59E0B] bg-[#FEF3C7] border-[#FDE68A]' };
  if (/card|panel|box|container|wrapper/i.test(lower))
    return { icon: CreditCard, label: 'Card Component', color: 'text-[#6366F1] bg-[#EEF2FF] border-[#C7D2FE]' };
  if (/table|grid|data/i.test(lower))
    return { icon: Table, label: 'Table Data', color: 'text-[#EC4899] bg-[#FDF2F8] border-[#FBCFE8]' };
  if (/list|item|rows/i.test(lower))
    return { icon: ListFilter, label: 'List View', color: 'text-[#14B8A6] bg-[#CCFBF1] border-[#99F6E4]' };
  if (/image|img|avatar|profile|photo|banner/i.test(lower))
    return { icon: ImageIcon, label: 'Media/Avatar', color: 'text-[#06B6D4] bg-[#CFFAFE] border-[#A5F3FC]' };
  return { icon: Box, label: 'UI Component', color: 'text-[#6B7280] bg-[#F3F4F6] border-[#E5E7EB]' };
}

export const WireframeNode: React.FC<WireframeNodeProps> = ({
  node,
  depth = 0,
  rawSection,
  onCanvasEdit,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const uiInfo = getComponentUiInfo(node.name);
  const UiIcon = uiInfo.icon;

  let borderColor = 'border-[#9CA3AF]';
  let bgColor = 'bg-white';
  let customShadow = '';

  if (isHovered) {
    borderColor = 'border-[#3B82F6]';
  }

  /**
   * rawLines[0]에 원본 줄이 저장되어 있으므로, 이름을 수정하면
   * 해당 원본 줄에서 이름 부분만 교체한다.
   */
  const handleNameEdit = (oldName: string, newName: string) => {
    if (!rawSection || !onCanvasEdit) return;
    const rawLine = node.rawLines?.[0];
    if (rawLine) {
      // 원본 줄에서 이름 텍스트를 교체 (트리 기호는 보존)
      const newLine = rawLine.replace(oldName, newName);
      onCanvasEdit(rawSection, rawLine, newLine);
    } else {
      // rawLine 없으면 텍스트 직접 교체
      onCanvasEdit(rawSection, oldName, newName);
    }
  };

  /**
   * props/events 값 수정: 마크다운에서 "Props: 값" 형태를 찾아 교체
   */
  const handlePropEdit = (oldVal: string, newVal: string) => {
    if (!rawSection || !onCanvasEdit) return;
    onCanvasEdit(rawSection, oldVal, newVal);
  };

  return (
    <div
      className={`relative my-2.5 transition-all duration-200 border-2 rounded-[6px] p-3 text-left ${borderColor} ${bgColor} ${customShadow}`}
      style={{ marginLeft: `${Math.min(depth * 16, 48)}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 노드 상단 헤더 라인 */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 overflow-hidden">
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-[#6B7280] hover:text-[#1F2937] transition-colors rounded cursor-pointer"
              title={isCollapsed ? '펼치기' : '접기'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {/* 스마트 UI 아이콘 & 컴포넌트 이름 */}
            <div className="flex items-center gap-1.5 font-mono text-[13px] font-bold text-[#1F2937] bg-[#F9FAFB] px-2 py-0.5 rounded-[4px] border border-[#E5E7EB]">
              <UiIcon size={14} className={uiInfo.color.split(' ')[0]} />
              {onCanvasEdit ? (
                <EditableInline
                  value={node.name}
                  onCommit={handleNameEdit}
                  className="font-mono text-[13px] font-bold text-[#1F2937]"
                />
              ) : (
                <span>{node.name}</span>
              )}
            </div>

            {node.children && node.children.length > 0 && (
              <span className="text-[11px] font-medium text-[#6B7280] shrink-0 font-mono">
                자식 컴포넌트({node.children.length})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] shrink-0 font-mono">
          <span>Component Node</span>
        </div>
      </div>

      {/* Props & Events 섹션 */}
      {(node.props.length > 0 || node.events.length > 0) && (
        <div className="flex flex-col gap-1.5 my-1.5 text-[12px] font-mono pt-1">
          {node.props.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#3B82F6] flex items-center gap-1 shrink-0">
                <Code size={12} />
                Props:
              </span>
              {onCanvasEdit ? (
                <EditableInline
                  value={node.props.join(', ')}
                  onCommit={(o, n) => handlePropEdit(o, n)}
                  className="text-[#374151]"
                />
              ) : (
                <span className="text-[#374151]">{node.props.join(', ')}</span>
              )}
            </div>
          )}

          {node.events.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#10B981] flex items-center gap-1 shrink-0">
                <Zap size={12} />
                Event:
              </span>
              {onCanvasEdit ? (
                <EditableInline
                  value={node.events.join(', ')}
                  onCommit={(o, n) => handlePropEdit(o, n)}
                  className="text-[#374151]"
                />
              ) : (
                <span className="text-[#374151]">{node.events.join(', ')}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 중첩 자식 컴포넌트 렌더링 */}
      {!isCollapsed && node.children && node.children.length > 0 && (
        <div className="mt-3 pt-2 border-t border-dashed border-[#D1D5DB] space-y-2">
          {node.children.map((child) => (
            <WireframeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              rawSection={rawSection}
              onCanvasEdit={onCanvasEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
