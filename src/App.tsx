import React, { useState, useEffect, useMemo } from 'react';
import { REPRESENTATIVE_PRD_MARKDOWN } from './data/samplePrds';
import { parsePRDMarkdown } from './utils/markdownParser';
import { computePRDDiff, computeLineDiff } from './utils/diffEngine';
import { TopHeader } from './components/TopHeader';
import { TocSidebar } from './components/TocSidebar';
import { ScreenCard } from './components/ScreenCard';
import { MarkdownEditorPopup } from './components/MarkdownEditorPopup';
import { BriefingModal } from './components/BriefingModal';
import { Layers, FileEdit, Sparkles, HelpCircle, ArrowUp, Info } from 'lucide-react';

import { ChangeLogItem } from './types';

export default function App() {
  // 캔버스 편집 → 마크다운 역방향 동기화 플래그 (편집 루프 방지)
  const isUpdatingFromCanvas = React.useRef(false);
  // 선택된 샘플 PRD ID 삭제

  // 현재 마크다운 텍스트, 이전 마크다운 텍스트, 초기 샘플 마크다운 텍스트 (초기 상태는 비어있음)
  const [currentMarkdown, setCurrentMarkdown] = useState<string>('');
  const [previousMarkdown, setPreviousMarkdown] = useState<string>('');
  const [initialMarkdown, setInitialMarkdown] = useState<string>('');
  const [isSampleCopied, setIsSampleCopied] = useState<boolean>(false);

  // 대표 샘플 PRD 클립보드 복사 처리
  const handleCopySampleMarkdown = () => {
    const textToCopy = REPRESENTATIVE_PRD_MARKDOWN;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setIsSampleCopied(true);
    setTimeout(() => setIsSampleCopied(false), 2000);
  };

  // UI 상태들
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState<boolean>(false);


  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // AI 브리핑 상태 및 변경 로그 상태
  const [aiBriefingText, setAiBriefingText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>([]);
  const lastLoggedSummaryRef = React.useRef<string>('');

  // 실시간 마크다운 파싱 및 Diff 계산
  const parsedCurrent = useMemo(() => {
    return parsePRDMarkdown(currentMarkdown);
  }, [currentMarkdown]);

  const parsedPrevious = useMemo(() => {
    return parsePRDMarkdown(previousMarkdown);
  }, [previousMarkdown]);

  const diffResult = useMemo(() => {
    return computePRDDiff(parsedCurrent, parsedPrevious);
  }, [parsedCurrent, parsedPrevious]);

  // 변경사항을 1개의 커밋 로그로 확정(Commit)
  const handleCommitLog = React.useCallback(() => {
    if (currentMarkdown === previousMarkdown) return;

    // 만약 이전 텍스트가 비어있었다면 (앱 초기화 후 최초 붙여넣기/입력), 
    // 전체가 '추가됨'으로 거대한 로그가 쌓이는 것을 방지하고 기준점(baseline)으로 설정합니다.
    if (previousMarkdown.trim() === '') {
      setPreviousMarkdown(currentMarkdown);
      setInitialMarkdown(currentMarkdown);
      return;
    }

    const lineChanges = computeLineDiff(previousMarkdown, currentMarkdown);
    if (lineChanges.length > 0) {
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];

      const newLogItem: ChangeLogItem = {
        id: 'log-' + Date.now(),
        timestamp,
        summaryText: diffResult.summaryText,
        lineChanges,
        addedScreens: diffResult.addedScreens,
        modifiedScreens: diffResult.modifiedScreens,
        removedScreens: diffResult.removedScreens,
        addedComponents: diffResult.addedComponents,
        modifiedComponents: diffResult.modifiedComponents,
        removedComponents: diffResult.removedComponents
      };

      setChangeLogs(prev => [newLogItem, ...prev]);
      setPreviousMarkdown(currentMarkdown);
    }
  }, [currentMarkdown, previousMarkdown, diffResult]);

  // 연속 타이핑 중에는 로그를 쪼개서 생성하지 않고, 3.5초 이상 유휴 상태일 때 자동 커밋
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCommitLog();
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentMarkdown, handleCommitLog]);

  const handleClearLogs = () => {
    setChangeLogs([]);
    lastLoggedSummaryRef.current = '';
  };

  /**
   * 캔버스에서 텍스트를 직접 편집했을 때 currentMarkdown에 반영.
   * rawSection: 해당 섹션의 rawMarkdown (교체 범위 특정용)
   * oldText: 교체 전 원본 텍스트
   * newText: 교체 후 새 텍스트
   */
  const handleCanvasEdit = React.useCallback(
    (rawSection: string, oldText: string, newText: string) => {
      if (oldText === newText) return;
      isUpdatingFromCanvas.current = true;
      setCurrentMarkdown(prev => {
        // rawSection이 prev 안에 있는 위치를 찾아 그 범위 안에서만 교체
        const sectionStart = prev.indexOf(rawSection);
        if (sectionStart === -1) {
          // fallback: 전체에서 첫 번째 일치 교체
          return prev.replace(oldText, newText);
        }
        const before = prev.slice(0, sectionStart);
        const section = prev.slice(sectionStart, sectionStart + rawSection.length);
        const after = prev.slice(sectionStart + rawSection.length);
        const updatedSection = section.replace(oldText, newText);
        return before + updatedSection + after;
      });
      // 다음 렌더 사이클에서 플래그 해제
      requestAnimationFrame(() => {
        isUpdatingFromCanvas.current = false;
      });
    },
    []
  );

  // 첫 번째 화면을 초기 활성 화면으로 설정
  useEffect(() => {
    if (parsedCurrent.screens.length > 0 && !activeScreenId) {
      setActiveScreenId(parsedCurrent.screens[0].id);
    }
  }, [parsedCurrent]);


  // 마크다운 복사 처리
  const handleCopyMarkdown = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentMarkdown);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = currentMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 스크롤 이동
  const handleSelectScreen = (screenId: string) => {
    setActiveScreenId(screenId);
    const element = document.getElementById(screenId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // AI 브리핑 요청 함수 (Express 백엔드 /api/briefing 호출)
  const handleRequestAiBriefing = async () => {
    setIsAiLoading(true);
    try {
      const parsedInit = parsePRDMarkdown(initialMarkdown);
      const diffInit = computePRDDiff(parsedCurrent, parsedInit);
      const lineChanges = computeLineDiff(initialMarkdown, currentMarkdown);

      let summaryForBriefing = diffInit.summaryText;

      // 구조적 변경이 없더라도 마크다운 텍스트 변경점이 있으면 요약 정보 구성
      if (!diffInit.hasChanges && lineChanges.length > 0) {
        const addedLines = lineChanges.filter(c => c.type === 'added').length;
        const modifiedLines = lineChanges.filter(c => c.type === 'modified').length;
        const removedLines = lineChanges.filter(c => c.type === 'removed').length;
        summaryForBriefing = `📝 **마크다운 텍스트 수정**: (수정된 줄: ${modifiedLines}개, 추가된 줄: ${addedLines}개, 삭제된 줄: ${removedLines}개)`;
      }

      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldMarkdown: initialMarkdown,
          newMarkdown: currentMarkdown,
          diffSummary: summaryForBriefing
        })
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setAiBriefingText(data.briefing);
      } else {
        setAiBriefingText('브리핑을 생성할 수 없습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (err: any) {
      setAiBriefingText('AI 브리핑 요청 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenBriefingModal = () => {
    setIsBriefingModalOpen(true);
    handleRequestAiBriefing();
  };

  return (
    <div className="min-h-screen bg-dot-grid text-[#1F2937] font-sans antialiased flex flex-col selection:bg-[#3B82F6] selection:text-white">
      {/* 최상단 헤더 */}
      <TopHeader
        appTitle="PRDView"
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
        onOpenBriefingModal={handleOpenBriefingModal}
        onCopySampleMarkdown={handleCopySampleMarkdown}
        isSampleCopied={isSampleCopied}
      />

      {/* 메인 레이아웃 (목차 패널 + 와이어프레임 캔버스) */}
      <div className="flex-1 flex relative">
        {/* 좌측 목차 패널 (TOC) */}
        <TocSidebar
          screens={parsedCurrent.screens}
          activeScreenId={activeScreenId}
          onSelectScreen={handleSelectScreen}
          isOpen={isTocOpen}
          onToggleOpen={() => setIsTocOpen(!isTocOpen)}
        />

        {/* 메인 와이어프레임 캔버스 영역 */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-32">
          {/* PRD 타이틀 및 개요 헤더 카드 */}
          <div className="bg-white border border-[#E5E7EB] p-6 mb-8 rounded-[6px] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1 border border-[#BFDBFE] rounded-[4px] font-mono">
                  Visualized Wireframe PRD
                </span>
                <h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight text-[#111827] mt-2">
                  {parsedCurrent.title}
                </h1>
              </div>

              {/* 시각화 메트릭 요약 */}
              <div className="flex items-center gap-3 text-[12px] font-mono text-[#6B7280]">
                <div className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[4px]">
                  Screens: <strong className="text-[#111827]">{parsedCurrent.screens.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 화면 카드 들 렌더링 */}
          {parsedCurrent.screens.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#D1D5DB] p-12 text-center rounded-[6px] space-y-3">
              <Info size={32} className="mx-auto text-[#9CA3AF]" />
              <h3 className="text-[16px] font-bold text-[#111827]">시각화할 화면이 없습니다.</h3>
              <p className="text-[13px] text-[#6B7280]">
                우측 하단 에디터에 마크다운 기획서를 작성하거나 예시 PRD를 선택해주세요.
              </p>
            </div>
          ) : (
            parsedCurrent.rootScreens.map((screen) => (
              <ScreenCard
                key={screen.id}
                screen={screen}
                onCanvasEdit={handleCanvasEdit}
              />
            ))
          )}
        </main>

        {/* 우측 고정 마크다운 에디터 사이드 패널 (접기/펼치기 가능) */}
        <MarkdownEditorPopup
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(!isEditorOpen)}
          markdown={currentMarkdown}
          baselineMarkdown={initialMarkdown}
          onChangeMarkdown={(val) => setCurrentMarkdown(val)}
          summaryText={diffResult.summaryText}
          changeLogs={changeLogs}
          onClearLogs={handleClearLogs}
          onCommitLog={handleCommitLog}
          onCopyMarkdown={handleCopyMarkdown}
          isCopied={isCopied}
          onRequestAiBriefing={handleRequestAiBriefing}
          isAiLoading={isAiLoading}
          aiBriefingText={aiBriefingText}
        />
      </div>

      {/* AI 변경사항 브리핑 모달 */}
      <BriefingModal
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
        diffResult={diffResult}
        aiBriefingText={aiBriefingText}
        isAiLoading={isAiLoading}
        onRequestAiBriefing={handleRequestAiBriefing}
        onCopyMarkdown={handleCopyMarkdown}
        isCopied={isCopied}
      />

    </div>
  );
}
