import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_PRDS } from './data/samplePrds';
import { parsePRDMarkdown } from './utils/markdownParser';
import { computePRDDiff } from './utils/diffEngine';
import { TopHeader } from './components/TopHeader';
import { TocSidebar } from './components/TocSidebar';
import { ScreenCard } from './components/ScreenCard';
import { MarkdownEditorPopup } from './components/MarkdownEditorPopup';
import { BriefingModal } from './components/BriefingModal';
import { Layers, FileEdit, Sparkles, HelpCircle, ArrowUp, Info } from 'lucide-react';

export default function App() {
  // 선택된 샘플 PRD ID
  const [selectedSampleId, setSelectedSampleId] = useState<string>('prdview-main');

  // 현재 마크다운 텍스트 및 이전 마크다운 텍스트 (Diff 계산용)
  const initialSample = SAMPLE_PRDS.find(s => s.id === 'prdview-main') || SAMPLE_PRDS[0];
  const [currentMarkdown, setCurrentMarkdown] = useState<string>(initialSample.markdown);
  const [previousMarkdown, setPreviousMarkdown] = useState<string>(initialSample.markdown);

  // UI 상태들
  const [highlightDiff, setHighlightDiff] = useState<boolean>(true);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState<boolean>(false);


  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // AI 브리핑 상태
  const [aiBriefingText, setAiBriefingText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

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

  // 첫 번째 화면을 초기 활성 화면으로 설정
  useEffect(() => {
    if (parsedCurrent.screens.length > 0 && !activeScreenId) {
      setActiveScreenId(parsedCurrent.screens[0].id);
    }
  }, [parsedCurrent]);

  // 샘플 변경 함수
  const handleSelectSample = (sampleId: string) => {
    const sample = SAMPLE_PRDS.find(s => s.id === sampleId);
    if (sample) {
      setSelectedSampleId(sampleId);
      setPreviousMarkdown(sample.markdown);
      setCurrentMarkdown(sample.markdown);
      setAiBriefingText(null);
    }
  };

  // 원본 되돌리기
  const handleResetToSample = () => {
    const sample = SAMPLE_PRDS.find(s => s.id === selectedSampleId);
    if (sample) {
      setCurrentMarkdown(sample.markdown);
      setPreviousMarkdown(sample.markdown);
      setAiBriefingText(null);
    }
  };

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
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldMarkdown: previousMarkdown,
          newMarkdown: currentMarkdown,
          diffSummary: diffResult.summaryText
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

  return (
    <div className="min-h-screen bg-dot-grid text-[#1F2937] font-sans antialiased flex flex-col selection:bg-[#3B82F6] selection:text-white">
      {/* 최상단 헤더 */}
      <TopHeader
        appTitle="PRDView"
        samplePrds={SAMPLE_PRDS}
        activeSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        highlightDiff={highlightDiff}
        onToggleHighlightDiff={() => setHighlightDiff(!highlightDiff)}
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
        onCopyMarkdown={handleCopyMarkdown}
        isCopied={isCopied}
        onOpenBriefingModal={() => setIsBriefingModalOpen(true)}
        onResetToSample={handleResetToSample}
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
                <div className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[4px]">
                  Status:{' '}
                  <strong className={diffResult.hasChanges ? 'text-[#10B981]' : 'text-[#3B82F6]'}>
                    {diffResult.hasChanges ? 'MODIFIED' : 'UP-TO-DATE'}
                  </strong>
                </div>
              </div>
            </div>

            {/* 변경 사항이 감지되었을 때 상단 알림 바 */}
            {diffResult.hasChanges && highlightDiff && (
              <div className="mt-4 p-3 bg-[#ECFDF5] border border-[#10B981] rounded-[6px] flex items-center justify-between text-[13px] text-[#065F46]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>
                    기획 변경 사항이 감지되었습니다. 와이어프레임 박스에{' '}
                    <strong className="text-[#10B981] font-extrabold">그린 시각적 하이라이트</strong>로 표기됩니다.
                  </span>
                </div>
                <button
                  onClick={() => setIsBriefingModalOpen(true)}
                  className="font-bold text-[#10B981] hover:underline shrink-0 text-[12px] cursor-pointer"
                >
                  [변경 요약 보기]
                </button>
              </div>
            )}
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
                highlightDiff={highlightDiff}
              />
            ))
          )}
        </main>

        {/* 우측 고정 마크다운 에디터 사이드 패널 (접기/펼치기 가능) */}
        <MarkdownEditorPopup
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(!isEditorOpen)}
          markdown={currentMarkdown}
          onChangeMarkdown={(val) => setCurrentMarkdown(val)}
          summaryText={diffResult.summaryText}
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
