import { ParsedPRD, ScreenSection, WireframeNodeData, ContentItem } from '../types';

/**
 * PRD 마크다운-to-와이어프레임 파서
 * 
 * [우선순위 규격 7.1]
 * 1. 헤딩(#/##/###) → 화면/섹션 경계
 * 2. 박스 문자(├─, └─, │)로 시작하는 트리 노드 → 와이어프레임 박스
 * 3. 트리 노드 하위에서 Props: / Event: 로 시작하는 줄 → 박스가 아니라 박스 안 텍스트
 * 4. 표 문법(| | |) → 표
 * 5. 그 외 전부(문단, 일반 불릿, 굵게/기울임 등) → 읽기용 텍스트 카드
 */

interface RawTreeNode {
  rawLine: string;
  cleanName: string;
  depth: number;
  props: string[];
  events: string[];
  children: RawTreeNode[];
  isPropOrEventOnly?: boolean;
}

export function parsePRDMarkdown(markdown: string): ParsedPRD {
  if (!markdown || !markdown.trim()) {
    return {
      title: '제목 없는 기획서',
      screens: [],
      rootScreens: [],
      rawMarkdown: ''
    };
  }

  const lines = markdown.split(/\r?\n/);

  // 전체 타이틀 추출 (첫 번째 # 헤딩 또는 문서의 첫 헤딩)
  let docTitle = 'PRD 와이어프레임 기획서';
  const firstHeader = lines.find(l => /^#\s+/.test(l.trim()));
  if (firstHeader) {
    docTitle = firstHeader.trim().replace(/^#\s+/, '');
  }

  const screens: ScreenSection[] = [];
  let currentScreen: ScreenSection | null = null;
  let currentSectionIndex = 0;
  let currentBlockLines: string[] = [];

  const flushBlock = () => {
    if (!currentScreen || currentBlockLines.length === 0) return;
    processLinesIntoScreen(currentScreen, currentBlockLines);
    currentBlockLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. 헤딩 (# / ## / ###) 파싱 - 노션 목차 스타일 동적 매핑
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      // 최상단 # 타이틀 줄이고 문서 제목과 동일한 경우, 화면 섹션이 아닌 문서 제목으로만 사용
      if (level === 1 && i < 3 && docTitle === title && screens.length === 0) {
        continue;
      }

      flushBlock();

      currentSectionIndex++;
      currentScreen = {
        id: `screen-${currentSectionIndex}-${title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-')}`,
        title: title,
        level: level,
        nodes: [],
        contentItems: [],
        rawMarkdown: line + '\n'
      };
      screens.push(currentScreen);
      continue;
    }

    // 헤딩이 나오기 이전, 실제 내용(공백 아닌 줄)이 있는 경우에만 첫 번째 헤딩이 나올 때까지 임시 섹션 유지
    if (!currentScreen) {
      if (!line.trim()) continue;
      currentSectionIndex++;
      currentScreen = {
        id: `screen-${currentSectionIndex}-section`,
        title: '시작 섹션',
        level: 1,
        nodes: [],
        contentItems: [],
        rawMarkdown: ''
      };
      screens.push(currentScreen);
    }

    currentScreen.rawMarkdown += line + '\n';
    currentBlockLines.push(line);
  }

  flushBlock();

  return {
    title: docTitle,
    screens,
    rootScreens: buildScreenTree(screens),
    rawMarkdown: markdown
  };
}

/**
 * 평탄한(flat) 헤딩 목록을 레벨(#/##/###) 기준 중첩 트리로 변환한다.
 * 목차(TOC)와 Diff는 기존처럼 평탄한 screens 배열을 그대로 사용하고,
 * 캔버스 렌더링만 이 트리(rootScreens)를 사용해 화면(#) 프레임 안에
 * 하위 섹션(##/###)이 중첩되도록 한다.
 */
function buildScreenTree(flatScreens: ScreenSection[]): ScreenSection[] {
  const roots: ScreenSection[] = [];
  const stack: ScreenSection[] = [];

  flatScreens.forEach(screen => {
    screen.children = [];

    while (stack.length > 0 && stack[stack.length - 1].level >= screen.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(screen);
    } else {
      stack[stack.length - 1].children!.push(screen);
    }

    stack.push(screen);
  });

  return roots;
}

function processLinesIntoScreen(screen: ScreenSection, lines: string[]) {
  let idx = 0;

  while (idx < lines.length) {
    const line = lines[idx];
    const trimmed = line.trim();

    if (!trimmed) {
      idx++;
      continue;
    }

    // 2. 박스 문자(├─, └─, │)가 포함된 트리 블록인지 판단
    if (isBoxTreeLine(line)) {
      const treeLines: string[] = [];
      while (idx < lines.length && (isBoxTreeLine(lines[idx]) || isPropOrEventUnderTree(lines[idx]))) {
        treeLines.push(lines[idx]);
        idx++;
      }

      // 트리 파싱 시도
      const { nodes, isFallback, fallbackLines } = parseTreeBlock(treeLines);
      if (isFallback) {
        screen.contentItems.push({
          id: `fallback-${Math.random().toString(36).substring(2, 7)}`,
          type: 'fallback',
          text: fallbackLines.join('\n')
        });
      } else {
        screen.nodes.push(...nodes);
      }
      continue;
    }

    // 3. 표 문법 (| ... |) 처리
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (idx < lines.length && lines[idx].trim().startsWith('|')) {
        tableLines.push(lines[idx]);
        idx++;
      }
      const tableContent = parseMarkdownTable(tableLines);
      if (tableContent) {
        screen.contentItems.push({
          id: `table-${Math.random().toString(36).substring(2, 7)}`,
          type: 'table',
          table: tableContent
        });
      }
      continue;
    }

    // 4. 코드 블록 (```)
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      idx++; // skip opening ```
      while (idx < lines.length && !lines[idx].trim().startsWith('```')) {
        codeLines.push(lines[idx]);
        idx++;
      }
      if (idx < lines.length) idx++; // skip closing ```

      // 실무 PRD는 트리 정렬을 지키려고 컴포넌트 트리를 ``` 코드 펜스로 감싸는 경우가 많다.
      // 펜스 안에 박스 문자(├└│)가 하나라도 있으면 코드가 아니라 트리로 보고 우선순위 2번 규칙을 적용한다.
      if (codeLines.some(isBoxTreeLine)) {
        const { nodes, isFallback, fallbackLines } = parseTreeBlock(codeLines);
        if (isFallback) {
          screen.contentItems.push({
            id: `fallback-${Math.random().toString(36).substring(2, 7)}`,
            type: 'fallback',
            text: fallbackLines.join('\n')
          });
        } else {
          screen.nodes.push(...nodes);
        }
        continue;
      }

      screen.contentItems.push({
        id: `code-${Math.random().toString(36).substring(2, 7)}`,
        type: 'code',
        text: codeLines.join('\n')
      });
      continue;
    }

    // 5. 구분선(---, ***, ___) 은 시각적 콘텐츠가 아니므로 카드로 만들지 않고 건너뛴다
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      idx++;
      continue;
    }

    // 6. 인용문(>) - 마크다운 기호를 제거하고 일반 텍스트 카드로 표시
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>+\s?/, '');
      screen.contentItems.push({
        id: `paragraph-${Math.random().toString(36).substring(2, 7)}`,
        type: 'paragraph',
        text: quoteText
      });
      idx++;
      continue;
    }

    // 7. 일반 불릿 또는 문단
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      screen.contentItems.push({
        id: `bullet-${Math.random().toString(36).substring(2, 7)}`,
        type: 'bullet',
        text: bulletText
      });
      idx++;
      continue;
    }

    // 일반 문단
    screen.contentItems.push({
      id: `paragraph-${Math.random().toString(36).substring(2, 7)}`,
      type: 'paragraph',
      text: trimmed
    });
    idx++;
  }
}

function isBoxTreeLine(line: string): boolean {
  // ├─, └─, │ 문자 포함 여부 체크
  return /[├└]─|│/.test(line);
}

function isPropOrEventUnderTree(line: string): boolean {
  const trimmed = line.trim();
  // Props: / Event: 로 시작하거나 불릿으로 시작하는 Props/Event
  return /^(-?\s*)?(Props|Event):\s*/i.test(trimmed);
}

function getTreeLineDepth(line: string): number {
  let depth = 0;
  let index = 0;

  // 줄 앞부분의 │, 공백, ├─, └─ 수 파악
  while (index < line.length) {
    const sub = line.substring(index);
    if (sub.startsWith('│')) {
      depth++;
      index += 1;
    } else if (sub.startsWith('├─') || sub.startsWith('└─')) {
      depth++;
      index += 2;
      break;
    } else if (sub.startsWith('  ')) {
      index += 2;
    } else if (sub.startsWith(' ')) {
      index += 1;
    } else {
      break;
    }
  }

  return Math.max(0, depth - 1);
}

function parseTreeBlock(lines: string[]): { nodes: WireframeNodeData[]; isFallback: boolean; fallbackLines: string[] } {
  try {
    // 트리 형제(├─/└─)들보다 앞서 박스 문자 없는 "루트 컴포넌트 이름" 줄이 오는 경우가 있다
    // (예: "LoginScreen // 로그인 화면" 다음 줄부터 ├─ Logo). 이 줄을 형제로 흩뿌리지 않고
    // 이후 트리 전체를 감싸는 루트 박스 이름으로 삼는다.
    let rootLabel: string | null = null;
    let treeLines = lines;
    const firstContentIdx = lines.findIndex(l => l.trim().length > 0);
    if (firstContentIdx !== -1) {
      const firstLine = lines[firstContentIdx];
      if (!isBoxTreeLine(firstLine) && !isPropOrEventUnderTree(firstLine)) {
        const label = firstLine.trim().replace(/\/\/.*$/, '').trim();
        if (label) {
          rootLabel = label;
          treeLines = lines.slice(firstContentIdx + 1);
        }
      }
    }

    const rawNodes: { name: string; depth: number; props: string[]; events: string[]; rawLine: string }[] = [];
    let currentRawNode: typeof rawNodes[0] | null = null;

    for (const line of treeLines) {
      // 파이프(│), 트리 기호, 불릿(-), 공백 등을 제거한 순수 텍스트 파악
      const cleanLine = line.replace(/^[│\s]*[├└]─\s*/, '').replace(/^[│\s-]+/, '').trim();

      // Props / Event 속성 줄 파악 (예: "- Props: ...", "Props: ...", "│ - Event: ...")
      const propMatch = cleanLine.match(/^Props:\s*(.*)$/i);
      const eventMatch = cleanLine.match(/^Event:\s*(.*)$/i);

      if (propMatch || eventMatch) {
        if (currentRawNode) {
          if (propMatch && propMatch[1]) {
            currentRawNode.props.push(propMatch[1].trim());
          }
          if (eventMatch && eventMatch[1]) {
            currentRawNode.events.push(eventMatch[1].trim());
          }
        }
        continue; // 새 박스 노드를 절대 생성하지 않고 스킵
      }

      // 노드 이름 파싱
      const nameMatch = line.match(/[├└]─\s*(.+)$/);
      let cleanName = '';
      let depth = getTreeLineDepth(line);

      if (nameMatch) {
        cleanName = nameMatch[1].trim();
      } else {
        const pureName = line.replace(/[│├└─\s]/g, '').trim();
        if (pureName) {
          cleanName = pureName;
        } else {
          continue;
        }
      }

      // 불릿(-) 제거 후 2차 Props/Event 체크
      const strippedName = cleanName.replace(/^-\s*/, '').trim();
      if (/^(Props|Event):/i.test(strippedName)) {
        if (currentRawNode) {
          if (/^Props:/i.test(strippedName)) {
            currentRawNode.props.push(strippedName.replace(/^Props:\s*/i, ''));
          } else {
            currentRawNode.events.push(strippedName.replace(/^Event:\s*/i, ''));
          }
        }
        continue;
      }

      currentRawNode = {
        name: cleanName,
        depth,
        props: [],
        events: [],
        rawLine: line
      };
      rawNodes.push(currentRawNode);
    }

    if (rawNodes.length === 0) {
      return { nodes: [], isFallback: true, fallbackLines: lines };
    }

    // 계층적 트리 구조(자식 박스 중첩)로 빌드
    const rootNodes: WireframeNodeData[] = [];
    const stack: { node: WireframeNodeData; depth: number }[] = [];

    rawNodes.forEach((rn, i) => {
      const nodeData: WireframeNodeData = {
        id: `node-${i}-${rn.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: rn.name,
        props: rn.props,
        events: rn.events,
        children: [],
        rawLines: [rn.rawLine]
      };

      while (stack.length > 0 && stack[stack.length - 1].depth >= rn.depth) {
        stack.pop();
      }

      if (stack.length === 0) {
        rootNodes.push(nodeData);
      } else {
        stack[stack.length - 1].node.children.push(nodeData);
      }

      stack.push({ node: nodeData, depth: rn.depth });
    });

    if (rootLabel) {
      const wrapperNode: WireframeNodeData = {
        id: `node-root-${rootLabel.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: rootLabel,
        props: [],
        events: [],
        children: rootNodes,
        rawLines: [lines[firstContentIdx]]
      };
      return { nodes: [wrapperNode], isFallback: false, fallbackLines: [] };
    }

    return { nodes: rootNodes, isFallback: false, fallbackLines: [] };
  } catch (e) {
    // 파싱 실패 폴백 (PRD 7.2 파싱 실패 폴백 규격)
    return {
      nodes: [],
      isFallback: true,
      fallbackLines: lines
    };
  }
}

function parseMarkdownTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;

  const parseRow = (l: string) =>
    l.split('|')
      .map(c => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

  const headers = parseRow(lines[0]);

  // 2번째 줄(---)은 구분선이므로 필터링
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.includes('---')) continue;
    const row = parseRow(lines[i]);
    if (row.length > 0) {
      rows.push(row);
    }
  }

  return { headers, rows };
}
