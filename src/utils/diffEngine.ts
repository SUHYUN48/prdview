import { ParsedPRD, ScreenSection, WireframeNodeData, DiffResult, DiffStatus } from '../types';

/**
 * PRD 변경 사항 비교(Visual Diff) 및 브리핑 요약 엔진
 */
export function computePRDDiff(current: ParsedPRD, previous?: ParsedPRD): DiffResult {
  if (!previous || !previous.screens || previous.screens.length === 0) {
    return {
      hasChanges: false,
      summaryText: '최초 작성된 PRD입니다. 비교 대상 이전 버전이 없습니다.',
      addedScreens: [],
      modifiedScreens: [],
      removedScreens: [],
      addedComponents: [],
      modifiedComponents: [],
      removedComponents: [],
      parsedCurrent: current
    };
  }

  const addedScreens: string[] = [];
  const modifiedScreens: string[] = [];
  const removedScreens: string[] = [];
  const addedComponents: string[] = [];
  const modifiedComponents: string[] = [];
  const removedComponents: string[] = [];

  const prevScreenMap = new Map<string, ScreenSection>();
  previous.screens.forEach(s => prevScreenMap.set(s.title.trim(), s));

  const currScreenMap = new Map<string, ScreenSection>();
  current.screens.forEach(s => currScreenMap.set(s.title.trim(), s));

  // 1. 화면(섹션) 비교 및 diffStatus 부여
  current.screens.forEach(currScreen => {
    const prevScreen = prevScreenMap.get(currScreen.title.trim());

    if (!prevScreen) {
      currScreen.diffStatus = 'added';
      addedScreens.push(currScreen.title);
      // 신규 화면의 모든 컴포넌트도 added 처리
      markAllNodesDiff(currScreen.nodes, 'added', addedComponents);
    } else {
      // 컴포넌트 및 마크다운 원문 비교
      const isRawChanged = currScreen.rawMarkdown.trim() !== prevScreen.rawMarkdown.trim();
      
      // 노드 세부 비교
      const nodeDiffChanged = diffNodeTrees(currScreen.nodes, prevScreen.nodes, addedComponents, modifiedComponents, removedComponents);

      if (isRawChanged || nodeDiffChanged) {
        currScreen.diffStatus = 'modified';
        modifiedScreens.push(currScreen.title);
      } else {
        currScreen.diffStatus = 'unchanged';
      }
    }
  });

  // 삭제된 화면
  previous.screens.forEach(prevScreen => {
    if (!currScreenMap.has(prevScreen.title.trim())) {
      removedScreens.push(prevScreen.title);
    }
  });

  const hasChanges =
    addedScreens.length > 0 ||
    modifiedScreens.length > 0 ||
    removedScreens.length > 0 ||
    addedComponents.length > 0 ||
    modifiedComponents.length > 0 ||
    removedComponents.length > 0;

  // 간결하고 명확한 텍스트 요약 (Briefing) 생성
  let summaryText = '';
  if (!hasChanges) {
    summaryText = '이전 버전과 동일합니다. 감지된 기획 변경 사항이 없습니다.';
  } else {
    const parts: string[] = [];
    if (addedScreens.length > 0) {
      parts.push(`✨ **신규 추가 화면 (${addedScreens.length})**: ${addedScreens.join(', ')}`);
    }
    if (modifiedScreens.length > 0) {
      parts.push(`✏️ **수정된 화면 (${modifiedScreens.length})**: ${modifiedScreens.join(', ')}`);
    }
    if (removedScreens.length > 0) {
      parts.push(`🗑️ **삭제된 화면 (${removedScreens.length})**: ${removedScreens.join(', ')}`);
    }
    if (addedComponents.length > 0) {
      parts.push(`➕ **새로 추가된 컴포넌트 박스**: ${addedComponents.slice(0, 5).join(', ')}${addedComponents.length > 5 ? ` 외 ${addedComponents.length - 5}개` : ''}`);
    }
    if (modifiedComponents.length > 0) {
      parts.push(`🔄 **속성/이벤트 수정된 컴포넌트**: ${modifiedComponents.slice(0, 5).join(', ')}${modifiedComponents.length > 5 ? ` 외 ${modifiedComponents.length - 5}개` : ''}`);
    }
    summaryText = parts.join('\n\n');
  }

  return {
    hasChanges,
    summaryText,
    addedScreens,
    modifiedScreens,
    removedScreens,
    addedComponents,
    modifiedComponents,
    removedComponents,
    parsedCurrent: current,
    parsedPrevious: previous
  };
}

function markAllNodesDiff(nodes: WireframeNodeData[], status: DiffStatus, tracker: string[]) {
  nodes.forEach(n => {
    n.diffStatus = status;
    tracker.push(n.name);
    if (n.children && n.children.length > 0) {
      markAllNodesDiff(n.children, status, tracker);
    }
  });
}

function diffNodeTrees(
  currNodes: WireframeNodeData[],
  prevNodes: WireframeNodeData[],
  addedComponents: string[],
  modifiedComponents: string[],
  removedComponents: string[]
): boolean {
  let isChanged = false;

  const prevNodeMap = new Map<string, WireframeNodeData>();
  prevNodes.forEach(p => prevNodeMap.set(p.name.trim(), p));

  currNodes.forEach(curr => {
    const prev = prevNodeMap.get(curr.name.trim());
    if (!prev) {
      curr.diffStatus = 'added';
      addedComponents.push(curr.name);
      markAllNodesDiff(curr.children, 'added', addedComponents);
      isChanged = true;
    } else {
      const propsMatch = JSON.stringify(curr.props) === JSON.stringify(prev.props);
      const eventsMatch = JSON.stringify(curr.events) === JSON.stringify(prev.events);
      const childrenChanged = diffNodeTrees(curr.children, prev.children, addedComponents, modifiedComponents, removedComponents);

      if (!propsMatch || !eventsMatch || childrenChanged) {
        curr.diffStatus = 'modified';
        modifiedComponents.push(curr.name);
        isChanged = true;
      } else {
        curr.diffStatus = 'unchanged';
      }
    }
  });

  return isChanged;
}
