# WireframeNode 실물 컴포넌트 목업 렌더링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `WireframeNode`가 컴포넌트를 "설명하는 스펙 카드"로 그리던 것을, 컴포넌트 종류별로 실제 그 컴포넌트처럼 보이는 그레이스케일 로파이 목업으로 그리도록 바꾼다.

**Architecture:** 타입 추론 로직을 `src/utils/wireframeTypeInfo.ts`로 분리하며 `category: 'leaf' | 'container'`를 추가한다. 타입별 시각 표현(버튼/인풋/카드/모달/헤더-내브/테이블/리스트/미디어)은 순수 프레젠테이션 컴포넌트로 `src/components/WireframeMockups.tsx`에 모아둔다. `WireframeNode.tsx`는 오케스트레이터로 남아 diff 글로우 링, 호버, props/events 한 줄 표시, 자식 재귀 렌더링(컨테이너 타입만)을 담당하고 실제 모양은 `WireframeMockups`에 위임한다.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS 4(Vite 플러그인), lucide-react 아이콘. 별도 테스트 프레임워크 없음.

## Global Constraints

- 범위는 `src/components/WireframeNode.tsx`와 `src/utils/wireframeTypeInfo.ts`(신규), `src/components/WireframeMockups.tsx`(신규)로 한정한다. `src/components/ScreenCard.tsx`, `TocSidebar.tsx`, `TopHeader.tsx`는 수정하지 않는다 — `WireframeNode`의 공개 props 시그니처(`{ node: WireframeNodeData; depth?: number; highlightDiff?: boolean }`)는 그대로 유지되므로 `ScreenCard.tsx`의 호출부는 변경할 필요가 없다.
- `src/types.ts`의 `WireframeNodeData`는 변경하지 않는다.
- 이름 기반 타입 추론 정규식(`/button|btn|.../` 등)의 판정 로직 자체는 바꾸지 않는다 — 파일만 옮기고 `category`, `type` 필드를 추가한다.
- 이 프로젝트엔 자동화 테스트 프레임워크(jest/vitest 등)가 없다. 각 태스크의 검증은 `npm run lint`(= `tsc --noEmit`)로 타입 체크 후, 프론트엔드 변경이므로 `npm run dev`로 개발 서버를 띄워 브라우저에서 직접 확인한다.
- 색상 방침: 목업 박스 전체엔 타입별 색을 쓰지 않는다(그레이스케일). 타입 아이콘 색은 Card/Modal/Box 컨테이너의 제목 줄에서만 쓴다(Box는 예외적으로 중립 회색 고정). diff(추가/수정)만 초록 글로우 링으로 표시하고 NEW/MODIFIED 텍스트 뱃지는 쓰지 않는다.
- 참고 스펙 문서: `docs/superpowers/specs/2026-08-05-wireframe-node-mockup-design.md`

---

## 참고: 컨테이너 타입별 자식 처리 방식 (구현 세부 결정)

스펙 문서는 "container 타입은 자식을 안쪽에 중첩 렌더링"이라고만 정의했다. 브레인스토밍 중 보여준 스타일 비교 목업(Header/Nav가 "LOGO Home About ≡"처럼 순수 텍스트 나열이었던 것)과 일관되도록, 이 플랜에서는 컨테이너 타입을 다시 두 방식으로 나눈다:

- **완전 재귀 중첩** (Card, Modal, Box-fallback): 자식을 실제 `<WireframeNode>`로 재귀 렌더링해 컨테이너 안쪽에 그대로 품는다. 접기/펼치기 토글이 있다.
- **평면 라벨 나열** (Header/Nav, Table, List): 자식의 `name` 텍스트만 사용해 가로 메뉴 아이템 / 테이블 컬럼 헤더 / 리스트 행으로 나열한다. 자식을 재귀적으로 목업 렌더링하지 않는다(내브 아이템이나 테이블 컬럼은 보통 텍스트 라벨이지 그 자체로 별도 컴포넌트가 아니므로). 접기/펼치기 토글 없음.

Button/Input Field/Media(leaf)는 자식이 있는 경우(드묾) 기존과 동일하게 아래에 들여쓰기로 나열한다.

---

### Task 1: 타입 추론 로직을 `wireframeTypeInfo.ts`로 분리하고 `category` 추가

**Files:**
- Create: `src/utils/wireframeTypeInfo.ts`
- Test: 없음(자동화 테스트 프레임워크 없음) — `npm run lint`로 타입 체크

**Interfaces:**
- Produces:
  - `type WireframeMockupType = 'button' | 'input' | 'media' | 'header-nav' | 'card' | 'modal' | 'table' | 'list' | 'box'`
  - `type WireframeCategory = 'leaf' | 'container'`
  - `type IconComponent = React.ComponentType<{ size?: number; className?: string }>`
  - `interface ComponentUiInfo { type: WireframeMockupType; category: WireframeCategory; icon: IconComponent; label: string; color: string }`
  - `function getComponentUiInfo(name: string): ComponentUiInfo`

- [ ] **Step 1: 파일 작성**

`src/utils/wireframeTypeInfo.ts` 전체 내용:

```tsx
import React from 'react';
import {
  MousePointerClick, TextCursorInput, AppWindow, PanelTop, CreditCard, Table,
  ListFilter, Image as ImageIcon, Box
} from 'lucide-react';

export type WireframeMockupType =
  | 'button' | 'input' | 'media'
  | 'header-nav' | 'card' | 'modal' | 'table' | 'list' | 'box';

export type WireframeCategory = 'leaf' | 'container';

export type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

export interface ComponentUiInfo {
  type: WireframeMockupType;
  category: WireframeCategory;
  icon: IconComponent;
  label: string;
  color: string;
}

// 컴포넌트 이름 기반 스마트 UI 타입 및 아이콘 자동 감지 함수
export function getComponentUiInfo(name: string): ComponentUiInfo {
  const lower = name.toLowerCase();

  if (/button|btn|action|submit|click/i.test(lower)) {
    return { type: 'button', category: 'leaf', icon: MousePointerClick, label: 'Button', color: 'text-[#3B82F6] bg-[#EFF6FF] border-[#BFDBFE]' };
  }
  if (/input|search|text|field|form|edit/i.test(lower)) {
    return { type: 'input', category: 'leaf', icon: TextCursorInput, label: 'Input Field', color: 'text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]' };
  }
  if (/modal|popup|dialog|overlay/i.test(lower)) {
    return { type: 'modal', category: 'container', icon: AppWindow, label: 'Modal/Popup', color: 'text-[#8B5CF6] bg-[#F5F3FF] border-[#DDD6FE]' };
  }
  if (/header|nav|top|bar|menu/i.test(lower)) {
    return { type: 'header-nav', category: 'container', icon: PanelTop, label: 'Header/Nav', color: 'text-[#F59E0B] bg-[#FEF3C7] border-[#FDE68A]' };
  }
  if (/card|panel|box|container|wrapper/i.test(lower)) {
    return { type: 'card', category: 'container', icon: CreditCard, label: 'Card Component', color: 'text-[#6366F1] bg-[#EEF2FF] border-[#C7D2FE]' };
  }
  if (/table|grid|data/i.test(lower)) {
    return { type: 'table', category: 'container', icon: Table, label: 'Table Data', color: 'text-[#EC4899] bg-[#FDF2F8] border-[#FBCFE8]' };
  }
  if (/list|item|rows/i.test(lower)) {
    return { type: 'list', category: 'container', icon: ListFilter, label: 'List View', color: 'text-[#14B8A6] bg-[#CCFBF1] border-[#99F6E4]' };
  }
  if (/image|img|avatar|profile|photo|banner/i.test(lower)) {
    return { type: 'media', category: 'leaf', icon: ImageIcon, label: 'Media/Avatar', color: 'text-[#06B6D4] bg-[#CFFAFE] border-[#A5F3FC]' };
  }

  return { type: 'box', category: 'container', icon: Box, label: 'UI Component', color: 'text-[#6B7280] bg-[#F3F4F6] border-[#E5E7EB]' };
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd "0804 prdview" && npm run lint`
Expected: 에러 없이 통과 (이 파일은 아직 어디서도 import되지 않으므로, 독립적으로 타입 오류만 없으면 됨)

- [ ] **Step 3: 커밋**

```bash
git add src/utils/wireframeTypeInfo.ts
git commit -m "Extract wireframe type inference into wireframeTypeInfo with leaf/container category"
```

---

### Task 2: 타입별 목업 프레젠테이션 컴포넌트 작성 (`WireframeMockups.tsx`)

**Files:**
- Create: `src/components/WireframeMockups.tsx`
- Test: 없음 — `npm run lint`로 타입 체크 (이 시점엔 아직 어디서도 사용되지 않음, Task 3에서 연결)

**Interfaces:**
- Consumes: `IconComponent` 타입은 구조적으로 Task 1의 `wireframeTypeInfo.ts`와 동일한 모양(`React.ComponentType<{ size?: number; className?: string }>`)이면 되므로 별도 import 없이 이 파일 안에서 다시 선언한다(순수 프레젠테이션 파일로 유지, 데이터 타입에 대한 의존 없음).
- Produces:
  - `ButtonMockup(props: { name: string; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `InputMockup(props: { name: string; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `MediaMockup(props: { name: string; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `HeaderNavMockup(props: { name: string; items: string[]; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `TableMockup(props: { columns: string[]; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `ListMockup(props: { name: string; rows: string[]; hasDiff: boolean; isHovered: boolean }): JSX.Element`
  - `ContainerShell(props: { variant: 'card' | 'modal' | 'box'; name: string; hasDiff: boolean; isHovered: boolean; icon?: IconComponent; iconColorClass?: string; hasChildren: boolean; isCollapsed: boolean; onToggleCollapse: () => void; children: React.ReactNode }): JSX.Element`

- [ ] **Step 1: 파일 작성**

`src/components/WireframeMockups.tsx` 전체 내용:

```tsx
import React from 'react';
import { ChevronRight, ChevronDown, Image as ImageIcon } from 'lucide-react';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

// diff/hover 상태에 따른 공통 테두리+링 클래스 (모든 목업 도형이 공유)
function shapeBorderClasses(hasDiff: boolean, isHovered: boolean): string {
  if (hasDiff) return 'border-[#10B981] ring-4 ring-[#10B981]/20';
  if (isHovered) return 'border-[#3B82F6]';
  return 'border-[#9CA3AF]';
}

interface LeafMockupProps {
  name: string;
  hasDiff: boolean;
  isHovered: boolean;
}

export function ButtonMockup({ name, hasDiff, isHovered }: LeafMockupProps) {
  return (
    <div
      className={`inline-flex items-center justify-center px-4 py-2 rounded-[6px] border-2 bg-[#E5E7EB] text-[13px] font-semibold text-[#374151] max-w-full truncate ${shapeBorderClasses(hasDiff, isHovered)}`}
    >
      {name}
    </div>
  );
}

export function InputMockup({ name, hasDiff, isHovered }: LeafMockupProps) {
  return (
    <div
      className={`w-full px-3 py-2 rounded-[6px] border-2 bg-white text-[13px] text-[#9CA3AF] truncate ${shapeBorderClasses(hasDiff, isHovered)}`}
    >
      {name}
    </div>
  );
}

export function MediaMockup({ name, hasDiff, isHovered }: LeafMockupProps) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-[6px] border-2 bg-[#F3F4F6] ${shapeBorderClasses(hasDiff, isHovered)}`}
    >
      <ImageIcon size={22} className="text-[#9CA3AF]" />
      <span className="text-[11px] text-[#9CA3AF] px-2 truncate max-w-full">{name}</span>
    </div>
  );
}

interface HeaderNavMockupProps {
  name: string;
  items: string[];
  hasDiff: boolean;
  isHovered: boolean;
}

export function HeaderNavMockup({ name, items, hasDiff, isHovered }: HeaderNavMockupProps) {
  return (
    <div
      className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-[6px] border-2 bg-[#F9FAFB] ${shapeBorderClasses(hasDiff, isHovered)}`}
    >
      <span className="text-[12px] font-extrabold text-[#374151] shrink-0 truncate max-w-[40%]">{name}</span>
      {items.length > 0 && (
        <div className="flex items-center gap-3 text-[12px] text-[#6B7280] overflow-hidden">
          {items.map((item, i) => (
            <span key={i} className="truncate">{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface TableMockupProps {
  columns: string[];
  hasDiff: boolean;
  isHovered: boolean;
}

export function TableMockup({ columns, hasDiff, isHovered }: TableMockupProps) {
  const cols = columns.length > 0 ? columns : ['Column A', 'Column B'];
  return (
    <div className={`w-full rounded-[6px] border-2 overflow-hidden bg-white ${shapeBorderClasses(hasDiff, isHovered)}`}>
      <div className="flex bg-[#F3F4F6]">
        {cols.map((col, i) => (
          <div key={i} className="flex-1 px-3 py-1.5 text-[11px] font-bold text-[#374151] border-r border-[#E5E7EB] last:border-r-0 truncate">
            {col}
          </div>
        ))}
      </div>
      <div className="flex">
        {cols.map((_, i) => (
          <div key={i} className="flex-1 px-3 py-2 border-r border-t border-[#E5E7EB] last:border-r-0">
            <div className="h-2 w-2/3 bg-[#E5E7EB] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ListMockupProps {
  name: string;
  rows: string[];
  hasDiff: boolean;
  isHovered: boolean;
}

export function ListMockup({ name, rows, hasDiff, isHovered }: ListMockupProps) {
  const items = rows.length > 0 ? rows : ['', ''];
  return (
    <div className={`w-full rounded-[6px] border-2 bg-white ${shapeBorderClasses(hasDiff, isHovered)}`}>
      <div className="px-3 py-2 text-[12px] font-bold text-[#374151] border-b border-dashed border-[#D1D5DB] truncate">
        {name}
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {items.map((row, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] shrink-0" />
            {row ? (
              <span className="text-[12px] text-[#6B7280] truncate">{row}</span>
            ) : (
              <span className="h-2 w-1/2 bg-[#E5E7EB] rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ContainerShellProps {
  variant: 'card' | 'modal' | 'box';
  name: string;
  hasDiff: boolean;
  isHovered: boolean;
  icon?: IconComponent;
  iconColorClass?: string;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: React.ReactNode;
}

export function ContainerShell({
  variant, name, hasDiff, isHovered, icon: Icon, iconColorClass,
  hasChildren, isCollapsed, onToggleCollapse, children
}: ContainerShellProps) {
  const shadow = variant === 'modal' ? 'shadow-[0_4px_14px_rgba(15,23,42,0.12)]' : '';
  return (
    <div className={`w-full rounded-[8px] border-2 bg-white ${shadow} ${shapeBorderClasses(hasDiff, isHovered)}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-[#D1D5DB]">
        {hasChildren && (
          <button
            onClick={onToggleCollapse}
            className="p-0.5 text-[#6B7280] hover:text-[#1F2937] transition-colors rounded cursor-pointer shrink-0"
            title={isCollapsed ? '펼치기' : '접기'}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
        {Icon && iconColorClass && <Icon size={13} className={`${iconColorClass} shrink-0`} />}
        <span className="text-[13px] font-bold text-[#374151] truncate">{name}</span>
      </div>
      {hasChildren && !isCollapsed && (
        <div className="p-3 space-y-2">{children}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `cd "0804 prdview" && npm run lint`
Expected: 에러 없이 통과

- [ ] **Step 3: 커밋**

```bash
git add src/components/WireframeMockups.tsx
git commit -m "Add presentational wireframe mockup shapes (button, input, card, modal, header-nav, table, list, media)"
```

---

### Task 3: `WireframeNode.tsx`를 목업 렌더링으로 전면 교체

**Files:**
- Modify: `src/components/WireframeNode.tsx` (전체 교체)

**Interfaces:**
- Consumes:
  - `getComponentUiInfo` from `../utils/wireframeTypeInfo` (Task 1)
  - `ButtonMockup, InputMockup, MediaMockup, HeaderNavMockup, TableMockup, ListMockup, ContainerShell` from `./WireframeMockups` (Task 2)
  - `WireframeNodeData` from `../types` (기존)
- Produces: `WireframeNode: React.FC<{ node: WireframeNodeData; depth?: number; highlightDiff?: boolean }>` — **공개 시그니처는 기존과 동일**하므로 `ScreenCard.tsx`는 수정 불필요.

- [ ] **Step 1: 기존 파일 내용 전체를 아래로 교체**

`src/components/WireframeNode.tsx` 전체 내용:

```tsx
import React, { useState } from 'react';
import { WireframeNodeData } from '../types';
import { getComponentUiInfo } from '../utils/wireframeTypeInfo';
import {
  ButtonMockup, InputMockup, MediaMockup,
  HeaderNavMockup, TableMockup, ListMockup, ContainerShell
} from './WireframeMockups';

interface WireframeNodeProps {
  node: WireframeNodeData;
  depth?: number;
  highlightDiff?: boolean;
}

// props/events를 한 줄짜리 작고 흐린 텍스트로 압축 (예: "props: id, disabled · onClick")
function formatPropsEventsLine(props: string[], events: string[]): string | null {
  const parts: string[] = [];
  if (props.length > 0) parts.push(`props: ${props.join(', ')}`);
  if (events.length > 0) parts.push(events.join(', '));
  if (parts.length === 0) return null;
  return parts.join(' · ');
}

export const WireframeNode: React.FC<WireframeNodeProps> = ({
  node,
  depth = 0,
  highlightDiff = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isAdded = highlightDiff && node.diffStatus === 'added';
  const isModified = highlightDiff && node.diffStatus === 'modified';
  const hasDiff = isAdded || isModified;

  const uiInfo = getComponentUiInfo(node.name);
  const hasChildren = node.children.length > 0;
  const propsEventsLine = formatPropsEventsLine(node.props, node.events);

  const wrapperStyle = { marginLeft: `${Math.min(depth * 16, 48)}px` };
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const propsEventsNode = propsEventsLine && (
    <p className="mt-1 px-1 text-[10px] text-[#9CA3AF] truncate">{propsEventsLine}</p>
  );

  // Leaf 타입 (Button / Input Field / Media-Avatar): 자체로 완결된 컴포넌트
  if (uiInfo.category === 'leaf') {
    const LeafMockup =
      uiInfo.type === 'button' ? ButtonMockup :
      uiInfo.type === 'input' ? InputMockup :
      MediaMockup;

    return (
      <div className="my-2.5" style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <LeafMockup name={node.name} hasDiff={hasDiff} isHovered={isHovered} />
        {propsEventsNode}
        {/* 리프 타입에 자식이 있는 드문 경우: 기존처럼 아래에 들여쓰기로 나열 */}
        {hasChildren && (
          <div className="mt-2 space-y-2">
            {node.children.map((child) => (
              <WireframeNode key={child.id} node={child} depth={depth + 1} highlightDiff={highlightDiff} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Header/Nav: 자식 이름을 가로 메뉴 아이템 라벨로만 사용 (재귀 렌더링 안 함)
  if (uiInfo.type === 'header-nav') {
    return (
      <div className="my-2.5" style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <HeaderNavMockup
          name={node.name}
          items={node.children.map((c) => c.name)}
          hasDiff={hasDiff}
          isHovered={isHovered}
        />
        {propsEventsNode}
      </div>
    );
  }

  // Table Data: 자식 이름을 컬럼 헤더로만 사용 (재귀 렌더링 안 함)
  if (uiInfo.type === 'table') {
    return (
      <div className="my-2.5" style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <TableMockup
          columns={node.children.map((c) => c.name)}
          hasDiff={hasDiff}
          isHovered={isHovered}
        />
        {propsEventsNode}
      </div>
    );
  }

  // List View: 자식 이름을 리스트 행 텍스트로만 사용 (재귀 렌더링 안 함)
  if (uiInfo.type === 'list') {
    return (
      <div className="my-2.5" style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <ListMockup
          name={node.name}
          rows={node.children.map((c) => c.name)}
          hasDiff={hasDiff}
          isHovered={isHovered}
        />
        {propsEventsNode}
      </div>
    );
  }

  // Card / Modal / Box(fallback): 자식을 실제 WireframeNode로 재귀 렌더링해 안쪽에 품음
  const variant = uiInfo.type === 'modal' ? 'modal' : uiInfo.type === 'card' ? 'card' : 'box';
  const iconColorClass = variant === 'box' ? 'text-[#9CA3AF]' : uiInfo.color.split(' ')[0];

  return (
    <div className="my-2.5" style={wrapperStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ContainerShell
        variant={variant}
        name={node.name}
        hasDiff={hasDiff}
        isHovered={isHovered}
        icon={uiInfo.icon}
        iconColorClass={iconColorClass}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      >
        {node.children.map((child) => (
          <WireframeNode key={child.id} node={child} depth={0} highlightDiff={highlightDiff} />
        ))}
      </ContainerShell>
      {propsEventsNode}
    </div>
  );
};
```

- [ ] **Step 2: 타입 체크**

Run: `cd "0804 prdview" && npm run lint`
Expected: 에러 없이 통과. 특히 `ScreenCard.tsx`에서의 `<WireframeNode node={...} highlightDiff={...} />` 호출부가 그대로 타입 통과하는지 확인 (props 시그니처를 안 바꿨으므로 통과해야 함).

- [ ] **Step 3: 개발 서버로 브라우저 육안 확인**

Run: `cd "0804 prdview" && npm run dev` (이미 3000번 포트가 사용 중이면 기존 서버가 최신 코드를 HMR로 반영하므로 새로 띄울 필요 없이 브라우저만 새로고침해도 됨)

브라우저에서 `http://localhost:3000` 열고 상단 샘플 선택기에서 **"PRDView 자기 자신을 설명하는 PRD"**(prdview-main, 기본 선택된 샘플)를 확인. 체크리스트:

1. **Leaf 타입**: `MenuButton`류 이름(버튼 계열)이 회색 채움의 둥근 버튼처럼 보이고 그 안에 이름 텍스트가 그대로 찍히는지. `Props: ...` / `Event: ...` 정보가 컴포넌트 아래 작고 흐린 회색 한 줄로만 나오는지(더 이상 별도 박스/아이콘 없이).
2. **Card 타입**(`ComponentBox`, `ComponentTreeContainer` 등 `box|card|container` 계열 이름): 제목 줄에 작은 컬러 아이콘 + 이름이 있고, 접기/펼치기 화살표가 있으며, 클릭 시 자식들이 안쪽에 패딩과 함께 접히는지.
3. **Header/Nav 타입**(`TopHeader` 등 `top|header|nav|bar|menu` 계열): 가로로 넓은 바 모양이고, 자식 이름들이 가로로 나열되는지(세로로 안 쌓이는지).
4. **UI Component(fallback) 타입**(정규식에 안 걸리는 이름, 예: `WireframeCanvas`): Card와 같은 틀이지만 제목 아이콘이 회색(중립)으로 나오는지.
5. **Diff 표시**: 우측 마크다운 에디터에서 컴포넌트 이름을 하나 바꾸거나 새 `- ComponentName` 줄을 추가한 뒤, 해당 컴포넌트 목업에 텍스트 뱃지 없이 은은한 초록 글로우 링만 생기는지 확인.
6. 다른 샘플(PawPal 등)도 한 번씩 선택해서 Table/List/Media 계열 이름이 있다면 그리드/리스트/이미지 박스 모양으로 나오는지 확인.

문제가 있으면 코드를 수정하고 이 Step을 다시 수행한다.

- [ ] **Step 4: 커밋**

```bash
git add src/components/WireframeNode.tsx
git commit -m "Render WireframeNode as type-specific mockup shapes instead of spec cards"
```

---

## Self-Review 결과

- **스펙 커버리지**: 스펙 문서의 "타입 분류(leaf/container)", "타입별 시각 표현", "색상 방침", "diff 표시(글로우 링만)", "props/events 상시 노출 한 줄", "라벨=실제 텍스트" 항목 모두 Task 1~3에서 구현됨. "ScreenCard.tsx 변경 안 함" 항목은 Global Constraints에서 명시하고 실제로 어떤 태스크도 그 파일을 건드리지 않음.
- **플레이스홀더 스캔**: 없음. 모든 스텝에 실행 가능한 전체 코드가 포함됨.
- **타입 일관성**: `ComponentUiInfo.type`/`category` 값이 Task 1 정의와 Task 3 사용처에서 동일한 문자열 리터럴(`'button'|'input'|'media'|'header-nav'|'card'|'modal'|'table'|'list'|'box'`)로 일치. `WireframeMockups.tsx`가 export하는 컴포넌트 이름과 props 타입이 Task 3의 import/사용부와 정확히 일치.
