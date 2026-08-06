export const REPRESENTATIVE_PRD_MARKDOWN = `# [PRD] PRDView - 마크다운 와이어프레임 시각화 웹서비스

## 1. 메인 화면 (Wireframe Canvas)

├─ MainLayout
│  - Props: activeView, isDiffMode
│  ├─ TopHeader
│  │  - Props: appTitle
│  │  └─ ActionButton
│  │     - Props: label, icon
│  │     - Event: onClick → 마크다운 에디터 팝업 열기
│  ├─ TocSidebar
│  │  - Props: headings, activeHeadingId
│  │  - Event: onSelectHeading → 해당 와이어프레임 화면 스크롤
│  ├─ CanvasArea
│  │  - Props: zoomLevel, panOffset
│  │  └─ ScreenCard
│  │     - Props: screenTitle, diffStatus
│  │     └─ ComponentTreeContainer
│  │        - Props: nodeCount, isFallback
│  │        └─ ComponentBox
│  │           - Props: nodeName, propsList, eventList
│  │           - Event: onClick → 해당 컴포넌트 하이라이트
│  └─ FloatingEditorButton
│     - Props: isOpened, hasBriefing
│     - Event: onClick → 마크다운 에디터 토글

## 2. 사이드 패널 (Popup Markdown Editor)

├─ EditorPopup
│  - Props: isOpen, isMinimized
│  ├─ PopupHeader
│  │  - Props: title, wordCount
│  │  └─ CloseButton
│  │     - Event: onClick → 팝업 최소화
│  ├─ MarkdownTextarea
│  │  - Props: value, placeholder
│  │  - Event: onChange → 와이어프레임 실시간 동기화
│  ├─ BriefingCard
│  │  - Props: briefingText, isAiGenerated
│  │  - Event: onClickRefresh → AI 변경사항 요약 재요청
│  └─ CopyMarkdownButton
│     - Props: label, copySuccess
│     - Event: onClick → 클립보드 복사

## 3. 파싱 규칙 테스트 (표 및 불릿)

| 구분 | 처리 방식 | 비고 |
| --- | --- | --- |
| 헤딩(#) | 화면/섹션 경계 | 네비게이션 목차로 자동 변환 |
| 박스문자(├─) | 중첩 컴포넌트 박스 | 와이어프레임 UI 생성 |
| Props/Event | 박스 내부 라벨 | 속성 라벨 텍스트로 노출 |

- 일반 체크리스트 불릿은 가독성 카드로 구분됩니다.
- 굵게 표시된 **중요 요구사항** 및 \`인라인 코드\`가 지원됩니다.
- 컴포넌트 트리 하위에 위치하지 않은 텍스트 블록은 일반 텍스트 카드로 시각화됩니다.
`;
