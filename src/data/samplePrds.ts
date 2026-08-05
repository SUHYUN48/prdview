import { SamplePRDOption } from '../types';

export const SAMPLE_PRDS: SamplePRDOption[] = [
  {
    id: 'prdview-main',
    title: 'PRDView 앱 기획서 (기본)',
    badge: '추천',
    description: '현재 프로젝트의 핵심 요구사항과 와이어프레임 구조가 정의된 마크다운 PRD입니다.',
    markdown: `# [PRD] PRDView - 마크다운 와이어프레임 시각화 웹서비스

## 1. 메인 화면 (Wireframe Canvas)

├─ MainLayout
│  - Props: activeView, isDiffMode
│  ├─ TopHeader
│  │  - Props: appTitle, sampleSelector
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
│     - Event: onClick → AI 에이전트 전달용 클립보드 복사

## 3. 파싱 규칙 테스트 (표 및 불릿)

| 구분 | 처리 방식 | 비고 |
| --- | --- | --- |
| 헤딩(#) | 화면/섹션 경계 | 네비게이션 목차로 자동 변환 |
| 박스문자(├─) | 중첩 컴포넌트 박스 | 와이어프레임 UI 생성 |
| Props/Event | 박스 내부 라벨 | 속성 라벨 텍스트로 노출 |

- 일반 체크리스트 불릿은 가독성 카드로 구분됩니다.
- 굵게 표시된 **중요 요구사항** 및 \`인라인 코드\`가 지원됩니다.
`
  },
  {
    id: 'ecommerce-29cm',
    title: '29CM 감성 취향 셀렉트샵 커머스 PRD',
    badge: '이커머스',
    description: '29CM의 감성 흑백 스타일, 메인 브랜드 홈, 베스트 상품 그리드, 결제 시트 UI 구조입니다.',
    markdown: `# [PRD] 29CM 라이크 셀렉트샵 메인 & 상품 상세

## 1. 메인 홈 화면 (Storefront)

├─ HomeLayout
│  - Props: theme="minimal-black", font="Pretendard"
│  ├─ EditorialNav
│  │  - Props: brandLogo, categories=["BEST", "29Magazine", "Showcase"]
│  │  - Event: onSelectCategory → 해당 카테고리 탭 전환
│  ├─ MainHeroBanner
│  │  - Props: imageRatio="16:9", title="Taste Select Shop"
│  │  └─ CarouselControl
│  │     - Props: currentSlide, totalSlides
│  │     - Event: onClickNext → 다음 화보 보기
│  ├─ BestProductGrid
│  │  - Props: columns=4, sort="POPULARITY"
│  │  └─ ProductGridItem
│  │     - Props: brand="29CM", name="Pretendard Wool Jacket", price=189000, discount="15%"
│  │     - Event: onClickProduct → 상품 상세페이지 이동
│  └─ GhostOutlineButton
│     - Props: label="더 많은 스타일 둘러보기", border="1px solid #dddddd"
│     - Event: onClick → Showcase 목록 페이지 이동

## 2. 상품 상세 페이지 (Product Detail)

├─ ProductDetailLayout
│  ├─ ImageGallery
│  │  - Props: mainImage, thumbnails
│  │  └─ CarouselControl
│  │     - Props: radius="9999px", bg="rgba(0,0,0,0.5)"
│  ├─ ProductInfoPanel
│  │  - Props: brandName="29CM", title="Minimal Oversized Trench", price=245000
│  │  ├─ DiscountTag
│  │  │  - Props: discountRate="20%", color="#ff4800"
│  │  ├─ QuantityInput
│  │  │  - Props: quantity=1, min=1, max=10
│  │  │  - Event: onChangeQuantity → 총 결제금액 recalculate
│  │  └─ AddToCartSheet
│  │     - Props: isOpen=true, totalPrice=196000
│  │     ├─ PurchaseButton
│  │     │  - Props: label="바로 구매하기", bg="#000000", fg="#ffffff"
│  │     │  - Event: onClick → 결제 창 호출
│  │     └─ CartButton
│  │        - Props: label="장바구니 담기", border="1px solid #000000"
│  │        - Event: onClick → 장바구니에 담기 토스트 노출
`
  },
  {
    id: 'quotecard-community',
    title: 'QuoteCard 명언 커뮤니티 앱 PRD (규격 예시)',
    badge: '예시',
    description: 'PRD 파싱 규격에 명시된 QuoteCard, VerseText, Props/Event 자식 박스 렌더링 예시입니다.',
    markdown: `# [PRD] QuoteCard 피드 및 상세 화면

## 1. 명언 피드 화면

├─ FeedLayout
│  - Props: filterCategory="전체"
│  ├─ FeedHeader
│  │  - Props: title="오늘의 문장"
│  └─ QuoteCard
│     - Props: title, author
│     - Event: onClick → 상세 화면 이동
│     └─ VerseText
│        - Props: content
│        - Event: onBookmark → 관심 문장 저장

## 2. 상세 보기 화면

├─ QuoteDetailScreen
│  ├─ NavigationBar
│  │  - Props: title="문장 상세"
│  │  - Event: onBack → 피드로 돌아가기
│  ├─ BigQuoteCard
│  │  - Props: content, author, bookTitle
│  │  ├─ LikeButton
│  │  │  - Props: count=128, isLiked=true
│  │  │  - Event: onClick → 좋아요 수 증감
│  │  └─ ShareButton
│  │     - Event: onClick → 링크 복사 레이어
│  └─ CommentList
│     - Props: commentsCount=14
`
  },
  {
    id: 'qmoa-prd',
    title: 'Qmoa PRD v1.0.8 (실무 PRD 테스트)',
    badge: '실무',
    description: '독서 구절 기록 앱의 실제 실무 PRD 12항목 문서 — 코드펜스로 감싼 컴포넌트 트리, 인용문, 표 등 파서 검증용.',
    markdown: "# Qmoa PRD v1.0.8\n\n> BDAI 9강·10강에서 다룬 \"PRD 12항목 템플릿\"을 기준으로, 기존 `PRD.txt`(기획 단계 문서)와 현재 실제 구현 상태(`PROJECT.md`, `SCREENS.md`, `schema.md`, `DESIGN.md`, 앱 소스코드)를 통합해 다시 작성한 문서.\n> 1~6번은 \"무엇을 만들지(What)\", 7~12번은 \"어떻게 만들지(How)\"를 다룬다. 12번 NOTES가 개선 기획서(다음 버전) 역할을 겸한다.\n\n---\n\n## 1. CONTEXT\n\n**문제**\n\n독서 감상을 기록하지만 내 생각의 흐름이 보이지 않고, 구절을 저장해도 필요한 순간에 다시 찾기 어렵다.\n\n**원인**\n\n- 흐름이 보이지 않는 이유: 기록이 시간이나 주제로 연결되지 않고 단편적으로 나열되어서\n- 찾기 어려운 이유: 기록이 쌓일수록 정리되지 않은 채 흩어져서\n\n**영향(근거 데이터)**\n\n- 프리토타입(\"좋아하는 구절로 내가 어떤 사람인지 알아보세요\") 방문자 33명 중 33%(11명)가 CTA 클릭 → 잠재 수요 확인\n- 구절을 저장하고 다시 읽은 경험이 있는 독자 5명 중 4명이 \"필요한 순간에 찾지 못한 경험\"이 있다고 응답\n- 인터뷰: \"내가 어떤 생각을 해왔는지가 먼저 보여요\", \"어떤 책을 읽었는지보다 어떤 생각을 했는지가 더 중요하다\"\n\n---\n\n## 2. TARGET USER\n\n**대상**: 독서 중 감상과 구절을 꾸준히 기록하는 2030 독자\n\n**상황**\n\n- 책을 읽다가 마음에 닿는 구절을 발견했을 때\n- 쌓인 기록을 훑어보고 싶지만 → 내 생각이 어떻게 변해왔는지 보이지 않을 때\n- 비슷한 감정이나 상황에서 전에 저장해둔 구절이 떠오르는데 → 어디에 있는지 모를 때\n\n**현재 대안 행동**\n\n- 카톡 나에게 보내기, 갤러리 스크린샷, 메모앱, 노션 등 여러 곳에 구절을 흩어 저장 중\n- 여러 앱에 분산 저장 → 단순 나열형 목록으로만 남음\n- 찾기를 포기하거나, 읽었던 날짜·책을 기억에 의존해 탐색\n\n---\n\n## 3. USER GOAL\n\n| 구분 | 내용 |\n|------|------|\n| 지금 상태 | 구절을 저장은 하지만 나열될 뿐, 생각의 변화도 안 보이고 필요할 때 못 찾음 |\n| 원하는 상태 | 쌓인 구절을 통해 내 생각의 흐름을 확인하고, 감정·주제에 따라 원하는 구절에 즉시 닿기 |\n| 가장 중요한 것 1개 | **저장 마찰 최소화** — 생각 패턴화도 구절 찾기도, 일단 구절이 충분히 쌓여야만 성립하는 후행 가치이기 때문 |\n\n**솔루션 가설**\n\n1. 구절이 시간순으로 주제(태그)와 함께 쌓이면 생각의 흐름과 변화가 자연스럽게 보인다\n2. 구절에 감정·주제 태그가 붙으면 필요한 순간에 원하는 구절에 쉽게 닿을 수 있다\n\n---\n\n## 4. SUCCESS CRITERIA\n\n**배경**: 이 앱의 가치는 \"저장\"이 아니라 **\"필요한 순간의 재발견\"**에서 발생한다(1번 문제 정의 — 쌓일수록 정작 필요할 때 못 찾는 탐색 실패). 따라서 핵심 지표는 재발견 자체를 직접 재고, 나머지 지표는 그 앞단(재발견 경로가 성립하는가 / 재발견할 재료가 쌓이는가)을 진단하는 역할로 배치한다. 재발견은 기록이 쌓인 뒤에야 성립하는 후행 가치이므로 모수를 한정해 측정한다.\n\n**핵심 지표**\n\n| 지표 | 목표값(가정) | 측정 방법 | 근거 |\n|------|------|-----------|------|\n| 구절 재발견률 | 20% → 40% | 모수: 구절 10개 이상 저장한 유저 / 분자: 해당 월에 `quote_opened`(`source` ∈ {`search`, `filter`}, `days_since_saved` ≥ 7)를 1회 이상 발생시킨 유저 수 | 문제 정의(\"쌓일수록 필요한 순간에 못 찾음\")를 그대로 뒤집은 지표. 인터뷰 5명 중 4명이 탐색 실패를 겪었다는 응답에서 현재값을 20%로 가정하고 그 2배를 목표로 설정 |\n\n**선행 지표 — 재발견 경로가 성립하는가**\n\n| 지표 | 목표값(가정) | 측정 방법 | 근거 |\n|------|------|-----------|------|\n| 태그 부착률 | 80% | `quote_saved` 이벤트의 `has_tag` 비율 | 태그가 안 붙으면 상황·감정별 분류 경로 자체가 없어 재발견이 불가능 |\n| 활용하는 태그 수 | 유저당 평균 4개 이상 | Firestore 쿼리 — 유저별 구절에 실제로 쓰인 서로 다른 tagId 개수 | 태그를 하나만 반복 사용하면 분류가 아니라 라벨에 그쳐 탐색 단서가 되지 못함 |\n| 태그 생성 수 | 유저당 평균 3개 이상 | `tag_created` 이벤트 수 ÷ 유저 수 | 기본 태그만 쓰면 범용 분류에 머물러 개인화가 안 됨 |\n| 검색·필터 진입률 | 월간 활성 유저 중 50% | `quote_searched` 이벤트를 1회 이상 발생시킨 유저 ÷ 월간 활성 유저 | 재발견률이 낮을 때 \"탐색을 안 한 것\"인지 \"탐색했는데 못 찾은 것\"인지 구분 |\n\n**보조 지표 — 축적·저장 마찰 진단**\n\n| 지표 | 목표값(가정) | 측정 방법 | 근거 |\n|------|------|-----------|------|\n| 구절 10개 도달 유저 비율 | 가입 30일 경과 유저 중 30% | Firestore 쿼리 집계, quotes count ≥10인 유저 수 ÷ 가입 30일 경과 유저 수 | 재발견 지표의 모수 자체를 키우는 선행 조건 |\n| D7 사용 리텐션 | 25% | Firebase Analytics 자동 측정(User Retention) | 반복 사용 루프가 작동하는지 확인 |\n| 온보딩 후 24h 내 첫 구절 저장률 | 80% | `onboarding_completed` 이벤트 시각 대비 `quote_saved` 최초 이벤트 시각 diff ≤24h, Firebase Analytics 퍼널 | 저장 마찰이 낮은지 확인, 카메라·OCR 진입 전 이탈이 없는지가 핵심 |\n| OCR 실패율 | 15% 미만 | `ocr_failed` 이벤트 수 ÷ (`ocr_failed` + OCR 경유 `quote_saved` 이벤트 수) | OCR이 저장 마찰 제거의 핵심 기능이므로, 실패율이 곧 마찰 재발 신호 |\n\n**측정 이벤트**\n\n| 이벤트 | 파라미터 | 발생 지점 |\n|------|------|-----------|\n| `onboarding_completed` | — | 온보딩 완료 |\n| `quote_saved` | `method`: `'manual'\\|'ocr'`, `has_tag`: boolean | 구절 저장 |\n| `ocr_failed` | — | OCR 인식 결과 0개 또는 인식 실패 |\n| `tag_created` | — | 태그 신규 생성 |\n| `quote_searched` | `method`: `'keyword'\\|'month'` | 홈 검색어 입력(디바운스 800ms 후 1회) / 월 필터 칩 선택 |\n| `quote_opened` | `source`: `'search'\\|'filter'\\|'timeline'`, `days_since_saved`: number | 홈에서 구절 카드를 눌러 상세로 진입 (`days_since_saved`는 `createdAt` 기준 경과 일수) |\n\n**Firestore 쿼리**: 유저당 구절/태그 수, 태그 부착률, 태그 추가·삭제 빈도\n**Firebase 자동 수집**: D7 리텐션, 세션 시작\n\n\n---\n\n## 5. CORE FEATURES\n\n| 기능 | 설명 | 하위 기능 |\n|------|------|-----------|-----------|\n| 구절 기록하기 | 기록 마찰을 최소화해 구절 중심으로 독후감을 기록 | 사진 촬영 · OCR 텍스트 인식 · 텍스트 수정/직접 입력 · 책 제목 입력 · 감정·주제 태그(단일 선택) · 태그 편집(이름·색) |\n| 구절 타임라인 | 시간에 따른 생각의 흐름을 시각화 | 월별 구절 목록 · 월 필터(FilterChip) · 느낀점 메모 |\n| 구절 검색 | 원하는 구절을 즉각 탐색·재확인 | 키워드 검색(구절 본문 통합) · 책 제목 검색 · 태그 검색 |\n| 마이페이지 기록 캘린더 | 저장한 구절을 날짜별로 돌아볼 수 있게 시각화 | 월 이동 · 날짜별 태그색 점 표시(구절 1개당 점 1개) · 오늘 날짜 강조 |\n\n**Out of Scope (현재도 유지)**\n\n| 기능 | 이유 |\n|------|------|\n| 책 DB 연결 | 책 중심보다 구절 중심 기록 서비스 — 없어도 가치 실현 가능 |\n| 통계 / 독서량 | 기록 압박 우려, 데이터 축적 이후 구현 가능 (태그 캘린더는 2026-07-16 결정으로 범위 포함 전환, 아래 CORE FEATURES 참고) |\n| 드라이브·로컬 스토리지 연결 | 서비스 방향에서 벗어남. 데이터 안정성 확장 시 적용 가능 |\n| AI 자동 패턴 분석 | 생성형 AI 만족도 불확실 |\n| 태그 클라우드 | 태그가 충분히 쌓인 후에야 의미 있는 시각화 가능 |\n| AI 이모지 태그 추천 | 태그 목록이 작은 현재 단계에선 수동 선택으로 충분 |\n\n**후속 기능 후보**\n\n- 홈화면 위젯 구절 노출\n- 1:1 구절 공유\n- 책 목록 공유\n- 커뮤니티 감상평 공유\n\n---\n\n## 6. DATA DEFINITION\n\nFirestore 기준 (`app/src/lib/*.ts` 구현과 일치).\n\n**`users/{uid}`**\n- `nickname` (string) — 닉네임 (예: \"책벌레\")\n- `birthYear` (number) — 출생연도 4자리, 마이페이지 프로필 표시에 사용 (예: 1995)\n- `termsAgreedAt` (Timestamp) — 서비스 이용약관 동의 시점\n- `privacyAgreedAt` (Timestamp) — 개인정보 처리방침 동의 시점\n- `createdAt` (Timestamp) — 가입 시점\n\n**`users/{uid}/quotes/{quoteId}`**\n- `text` (string) — 구절 텍스트 (예: \"인생은 소중하다\")\n- `bookTitle` (string 또는 null) — 책 제목, 선택 입력 (예: \"데미안\")\n- `page` (number 또는 null) — 책 페이지 번호, 선택 입력, 숫자만 허용 (예: 55)\n- `tagIds` (string[]) — 태그 ID 배열, 현재 UI는 단일 선택만 허용 (예: [\"tag_abc123\"])\n- `date` (Timestamp) — 사용자 지정 날짜, 기본값은 저장 시점이며 편집 가능\n- `createdAt` (Timestamp) — 실제 저장 시각, 불변\n\n**`users/{uid}/quotes/{quoteId}/memos/{memoId}`**\n- `text` (string) — 메모(느낀점) 텍스트 (예: \"이 문장이 위로가 됐다\")\n- `createdAt` (Timestamp) — 작성 시점\n\n**`users/{uid}/tags/{tagId}`**\n- `name` (string) — 태그 이름, 기본 태그도 수정 가능 (예: \"감동\")\n- `color` (string) — yellow / red / green / blue / purple / orange 중 하나\n- `isSystem` (boolean) — true: 기본 6개 / false: 사용자 추가 (삭제 가드 없음 — `isSystem` 태그도 삭제 가능)\n- `createdAt` (Timestamp) — 생성 시점\n- `updatedAt` (Timestamp) — 마지막 수정 시점 (생성 시 `createdAt`과 동일)\n\n**기본 태그 6개** (온보딩 시 자동 batch write): 감동(red) · 위로(green) · 사색(blue) · 공감(orange) · 설렘(yellow) · 사랑(purple)\n\n---\n\n## 7. COMPONENT STRUCTURE\n\n`DESIGN.md`에 정의된 공용 컴포넌트를 기준으로, 화면을 레고 블록처럼 쪼갠다. 블록 이름은 역할이 드러나게 영어로 쓰고, Props(받는 정보)와 Event(눌렀을 때 일어나는 일)를 구분해 트리로 정리한다.\n\n### 공용 컴포넌트 (Props / Event)\n\n**Button**\n- Props: label(버튼 텍스트) · variant(Primary 강조 / Secondary 보조 / Ghost 텍스트만) · size(Sm / Md) · disabled(비활성 여부)\n- Event: onPress — 탭하면 화면마다 정해진 동작 실행\n\n**Input**\n- Props: label(입력창 이름표) · placeholder(안내 문구) · value(입력값) · multiline(여러 줄 여부) · state(Default / Focused / Error / Disabled) · errorMessage(에러 문구)\n- Event: onChangeText — 입력할 때마다 값 갱신\n\n**Tag**\n- Props: label(태그 이름) · color(6색 중 1) · selected(선택 여부)\n- Event: onPress — 탭하면 선택/해제\n\n**QuoteCard**\n- Props: quoteBody(구절 본문) · source(책 제목, 선택) · page(쪽 번호, 선택) · tagList(태그 목록, 선택) · date(날짜, 선택) · state(Expanded / Collapsed)\n- Event: onPress — 탭하면 구절 상세 화면으로 이동\n\n**FilterChip**\n- Props: label(필터 이름) · selected(선택 여부)\n- Event: onPress — 탭하면 해당 필터로 전환\n\n**TopBar**\n- Props: title(화면 제목) · showBack(뒤로가기 표시 여부) · showRight(우측 아이콘 표시 여부)\n- Event: onBack — 탭하면 이전 화면으로 이동\n\n**Divider**\n- Props: 없음(구분선 표시용)\n\n**BottomSheet**\n- Props: visible(표시 여부) · variant(Default 콘텐츠만 / Action 확인·취소 포함) · title(제목, 선택) · content(선택 목록)\n- Event: onClose — 바깥 영역을 탭하거나 닫으면 닫힘\n\n**Modal**\n- Props: visible(표시 여부) · variant(Alert 확인만 / Confirm 확인+취소) · title(제목) · body(본문)\n- Event: onConfirm(확인 탭) · onCancel(취소 탭) · onClose(닫기)\n\n### 화면별 컴포넌트 구조 (전체 12화면)\n\n**S-01 로그인**\n```\nLoginScreen  // 로그인 화면\n├─ Logo\n│   - Props: slogan=\"마음에 닿는 문장을 저장해 보세요.\"\n│\n└─ LoginButton\n    - Props: label=\"카카오로 시작하기\"\n    - Event: onPress → 로그인 처리 → 신규 회원이면 온보딩, 기존 회원이면 홈으로 이동\n```\n\n**S-02 온보딩**\n```\nOnboardingScreen  // 온보딩 화면\n├─ TopBar\n│   - Props: title 없음\n│\n├─ NicknameInput\n│   - Props: placeholder=\"닉네임을 입력해 주세요.\"\n│\n├─ BirthYearInput\n│   - Props: placeholder=\"예) 1995\"(숫자 4자리만 입력)\n│\n├─ AgreementCheckbox × 3개\n│   - Props: label(이용약관 / 개인정보 수집·이용 동의 / 만 14세 이상)\n│   - Event: onToggle → 체크 반전, 앞의 2개는 onLinkPress로 약관·개인정보 화면 이동\n│\n└─ StartButton\n    - Props: disabled(3개 모두 체크 + 닉네임·출생연도 입력 전까지)\n    - Event: onPress → 가입 완료 처리(기본 태그 6개 자동 생성) → 홈으로 이동\n```\n\n**S-03 홈 타임라인**\n```\nHomeScreen  // 홈 타임라인\n├─ HomeHeader\n│   - Props: logo=\"Qmoa\"\n│   - Event: onPressProfile → 마이페이지 이동\n│\n├─ SearchInput\n│   - Props: placeholder=\"키워드로 검색\"\n│   - Event: onChangeText → 구절 목록 실시간 필터\n│\n├─ FilterChip × N개\n│   - Props: label(전체 + 실제 등장하는 월), selected\n│   - Event: onPress → 해당 월 필터로 전환\n│\n├─ Divider\n│   - Props: 없음\n│\n├─ QuoteCard × N개\n│   - Props: quoteBody, source, page, tagList, date, expanded(화면 중앙 카드만 true)\n│   - Event: onPress → 구절 상세 화면 이동\n│\n├─ Dot × N개\n│   - Props: active(현재 펼쳐진 카드 여부)\n│   - Event: onPress → 해당 구절로 스크롤 이동\n│\n└─ RecordFAB\n    - Props: icon=\"+\"\n    - Event: onPress → 카메라 화면 이동\n```\n\n**S-04 구절 상세·메모**\n```\nQuoteDetailScreen  // 구절 상세·메모\n├─ TopBar\n│   - Props: title=\"구절 메모\", showBack\n│\n├─ QuoteCard\n│   - Props: quoteBody, source, page, tagList, date\n│   - Event: onPressMore → 구절 옵션 시트 열림\n│\n├─ MemoItem × N개\n│   - Props: text, date, editing(수정 중 여부)\n│   - Event: onPressMore → 메모 옵션 시트 열림\n│\n├─ MemoInput\n│   - Props: placeholder=\"느낀점을 남겨보세요\"\n│   - Event: onSubmit → 메모 추가\n│\n├─ QuoteOptionSheet\n│   - Props: options(\"수정하기\" / \"삭제하기\")\n│   - Event: onSelect → 수정하기: 구절 저장 화면(편집 모드) 이동 / 삭제하기: 삭제 확인창 열림\n│\n├─ MemoOptionSheet\n│   - Props: options(\"수정하기\" / \"삭제하기\")\n│   - Event: onSelect → 수정하기: 해당 메모 인라인 편집 전환 / 삭제하기: 삭제 확인창 열림\n│\n└─ DeleteConfirmModal\n    - Props: body\n    - Event: onConfirm → 구절 또는 메모 삭제 처리\n```\n\n**S-05 카메라**\n```\nCameraScreen  // 카메라\n├─ CameraHeader\n│   - Props: title=\"구절 촬영\"\n│\n├─ BackButton\n│   - Props: 없음\n│   - Event: onPress → 이전 화면으로 이동\n│\n├─ SkipButton\n│   - Props: 없음\n│   - Event: onPress → 이전 화면(구절 저장)으로 복귀, 입력값 유지\n│\n├─ PermissionNotice\n│   - Props: message=\"카메라 접근 권한이 필요합니다\"(권한 없을 때만 표시)\n│\n├─ AllowButton\n│   - Props: 없음\n│   - Event: onPress → 권한 요청\n│\n├─ CameraPreview\n│   - Props: facing(전면/후면)\n│\n├─ GalleryButton\n│   - Props: 없음\n│   - Event: onPress → 갤러리에서 이미지 선택 → 텍스트 선택 화면 이동\n│\n├─ ShutterButton\n│   - Props: disabled(사진 저장 처리 중)\n│   - Event: onPress → 사진 저장 → 텍스트 선택 화면 이동\n│\n└─ FlipButton\n    - Props: 없음\n    - Event: onPress → 카메라 방향 전환\n```\n\n**S-06 OCR 텍스트 선택**\n```\nOcrScreen  // OCR 텍스트 선택\n├─ CapturedImage\n│   - Props: source\n│\n├─ WordOverlay\n│   - Props: words, selected\n│   - Event: onDrag → 단어 선택/해제\n│\n├─ ResetButton\n│   - Props: 없음\n│   - Event: onPress → 선택 전체 해제\n│\n└─ UseTextButton\n    - Props: disabled(선택된 단어 없음)\n    - Event: onPress → 선택 텍스트를 구절 저장 화면으로 전달\n```\n\n**S-07 구절 저장**\n```\nRecordScreen  // 구절 저장\n├─ TopBar\n│   - Props: title=\"구절 저장\"(신규) 또는 \"구절 수정\"(편집), showBack\n│\n├─ QuoteInput\n│   - Props: placeholder, multiline\n│\n├─ AddTextButton\n│   - Props: 없음\n│   - Event: onPress → 카메라 화면 이동(재촬영)\n│\n├─ DateInput\n│   - Props: value(기본값 오늘), state(형식 오류 시 Error)\n│\n├─ BookTitleInput\n│   - Props: value(선택 입력)\n│\n├─ PageInput\n│   - Props: value(선택 입력, 숫자만 입력 가능)\n│\n├─ Tag × N개\n│   - Props: label, color, selected(한 번에 1개만)\n│   - Event: onPress → 태그 선택/해제\n│\n├─ AddTagButton\n│   - Props: 없음\n│   - Event: onPress → 태그 추가창 열림\n│\n├─ AddTagModal\n│   - Props: 없음\n│   - Event: onConfirm → 새 태그 생성 후 자동 선택\n│\n└─ SaveButton\n    - Props: disabled(구절 비어있음 / 날짜 오류 / 처리 중), label(처리 중엔 \"저장 중...\")\n    - Event: onPress → 저장 처리 → 홈 화면 이동\n```\n\n**S-08 마이페이지**\n```\nMyPageScreen  // 마이페이지\n├─ TopBar\n│   - Props: title=\"마이페이지\", showBack, rightIcon(설정 아이콘)\n│   - Event: onPressSettings → 설정 화면(S-12) 이동\n│\n├─ ProfileCard\n│   - Props: nickname, birthYear\n│\n└─ Calendar\n    - Props: dotsByDate(날짜별 태그색 점 배열), currentMonth\n    - Event: onPressPrevMonth / onPressNextMonth → currentMonth 변경\n```\n\n**S-09 프로필 수정**\n```\nProfileEditScreen  // 프로필 수정\n├─ TopBar\n│   - Props: title=\"프로필 수정\", showBack\n│\n├─ NicknameInput\n│   - Props: value(기존 값으로 초기화)\n│\n├─ BirthYearInput\n│   - Props: value(기존 값으로 초기화)\n│\n└─ SaveButton\n    - Props: disabled(처리 중)\n    - Event: onPress → 프로필 수정 처리 → 마이페이지로 복귀\n```\n\n**S-10 태그 설정**\n```\nTagsScreen  // 태그 설정\n├─ TopBar\n│   - Props: title=\"태그 설정\", showBack\n│\n├─ TagRow × N개\n│   - Props: name, color, quoteCount(연결된 구절 수)\n│   - Event: onPressMore → 태그 옵션 시트 열림\n│\n├─ AddTagButton\n│   - Props: 없음\n│   - Event: onPress → 태그 추가창 열림\n│\n├─ TagOptionSheet\n│   - Props: options(\"수정하기\" / \"삭제하기\")(기본 태그는 삭제 옵션 없음)\n│   - Event: onSelect → 수정하기: 태그 수정창 열림 / 삭제하기: 삭제 확인창 열림\n│\n├─ TagEditModal\n│   - Props: 없음\n│   - Event: onConfirm → 태그 이름·색 수정\n│\n└─ DeleteConfirmModal\n    - Props: 없음\n    - Event: onConfirm → 태그 삭제(연결된 구절에서도 자동 제거) / 실패 시 오류 안내\n```\n\n**S-11 이용약관**\n```\nTermsScreen  // 이용약관\n├─ TopBar\n│   - Props: title=\"이용약관\", showBack\n│\n└─ Article × 10개\n    - Props: title, body\n```\n\n**S-12 설정**\n```\nSettingsScreen  // 설정\n├─ TopBar\n│   - Props: title=\"설정\", showBack\n│\n├─ SettingsRow × 3개\n│   - Props: label(계정 정보 / 프로필 설정 / 태그 설정), value(계정 정보만 email 표시)\n│   - Event: onPress → 각 화면 이동(계정 정보는 이동 없음)\n│\n├─ SettingsRow × 4개\n│   - Props: label(이용약관 / 개인정보처리방침 / 문의하기 / 버전), value(버전만 앱 버전 표시)\n│   - Event: onPress → 각 화면 이동 또는 메일 작성 실행(문의하기), 버전은 이동 없음\n│\n├─ LogoutText\n│   - Props: 없음\n│   - Event: onPress → 로그아웃 확인창 열림\n│\n└─ LogoutConfirmModal\n    - Props: 없음\n    - Event: onConfirm → 로그아웃 처리 → 로그인 화면 이동\n```\n\n---\n\n## 8. STATE DEFINITION\n\nBDAI 10강 예시(리뷰+필터 앱)와 구조가 동일한 **S-03 홈 타임라인**(필터+목록 화면)을 대표 예시로 상태 3가지 — **active**(선택된 것) · **loading**(로딩 여부) · **filtered**(필터링된 결과) — 를 정의한다. 상태 전환이 특히 돋보이는 **S-04, S-07**도 같은 형식으로 추가한다. 나머지 화면(단순 loading만 있는 화면)은 9번 INTERACTION 설명으로 충분해 생략한다. \"언제 바뀌는가\"는 9번에서 트리거→상태변화 체인으로 다루므로 여기서는 중복하지 않는다.\n\n| 화면 | 대상 | 상태명 | 초기값 |\n|------|------|--------|--------|\n| S-03 | FilterChip | active | \"전체\" |\n| S-03 | QuoteCard | loading | true |\n| S-03 | QuoteCard, Dot | active | 첫 번째 QuoteCard만 expanded(나머지 collapsed), 첫 번째 Dot만 active |\n| S-03 | QuoteCard | filtered | 빈 배열 |\n| S-04 | QuoteCard | loading | true |\n| S-04 | MemoItem(그대로 / 수정 중 / 삭제) | active | 그대로 |\n| S-07 | SaveButton | loading | false |\n| S-07 | Tag | active | 없음(신규) / 기존 태그가 selected(편집 모드) |\n\n---\n\n## 9. INTERACTION\n\n8번에서 정의한 상태명을 그대로 이어받아, \"트리거 → 상태 변화 → 결과\" 순서로 쓴다. BDAI 10강 예시와 동일하게, 정상 케이스와 예외 케이스를 반드시 함께 적는다 — 예외를 빠뜨리면 로딩 중이거나 결과가 0건일 때 \"화면이 멍해 있는\" 순간이 생긴다.\n\n### S-01 로그인\n\n1. LoginButton 클릭 → 로그인 처리 → 신규 회원이면 온보딩 화면 이동, 기존 회원이면 홈 화면 이동\n\n### S-02 온보딩\n\n**NORMAL**\n1. NicknameInput·BirthYearInput 입력 + AgreementCheckbox 3개 체크 → StartButton 활성화 → 클릭 → 가입 처리 → 홈 화면 이동\n\n**EXCEPTION**\n2. 필수 입력 미충족 → StartButton 비활성 유지\n\n### S-03 홈 타임라인 — 월 필터 인터랙션 (8번 상태 그대로 사용)\n\n**NORMAL · 정상 케이스**\n1. FilterChip 선택 → active 변경 → filtered 다시 계산 → 전체/해당 월 구절만 보임\n2. SearchInput 검색어 입력 → filtered 다시 계산(active + 검색어 반영) → 검색 결과만 보임\n3. Dot 클릭 → active 상태 변경 → 해당 QuoteCard로 이동, Expanded 전환\n4. 스크롤 → 화면 중앙 QuoteCard가 Expanded로 전환 → 화면을 벗어난 QuoteCard는 Collapsed로 전환\n\n**EXCEPTION · 예외 상황**\n5. loading=true인 동안 → SearchInput·FilterChip·QuoteCard 목록 대신 스피너만 표시(조작 불가)\n6. filtered 결과 0건 → 구절 자체가 없으면 \"아직 저장한 구절이 없어요\", 필터·검색으로 0건이면 \"검색 결과가 없습니다\" 표시\n\n### S-04 구절 상세·메모\n\n**NORMAL**\n1. 화면 진입 → loading → QuoteCard·MemoItem 로드 완료 → loading 해제 → 목록 표시\n2. MemoInput 작성 후 전송 → MemoItem 목록에 추가\n3. MemoItem 더보기 클릭 → MemoOptionSheet 열림 → \"수정하기\" 선택 → 해당 MemoItem 인라인 편집 전환 → 저장 → 편집 종료\n4. MemoOptionSheet에서 \"삭제하기\" 선택 → 삭제 확인 모달 열림 → 확인 시 삭제, 취소 시 원래대로\n\n**EXCEPTION**\n5. QuoteCard 삭제 시 → 연결된 MemoItem 전체 삭제\n\n### S-05 카메라\n\n**NORMAL**\n1. ShutterButton 클릭 → 사진 저장 → OCR 텍스트 선택 화면 이동\n2. GalleryButton 클릭 → 이미지 선택 → OCR 텍스트 선택 화면 이동\n\n**EXCEPTION**\n3. 카메라 권한 없음 → PermissionNotice 표시 → AllowButton 클릭 → 권한 요청 → 허용 시 CameraPreview 전환\n4. 갤러리 선택 취소 → 화면 유지\n\n### S-06 OCR 텍스트 선택\n\n**NORMAL**\n1. 화면 진입 → loading → 인식 완료 → loading 해제 → 오버레이 표시\n2. 오버레이 드래그 선택 → selected 추가/제거 → 구절 선택 버튼 활성화 → 클릭 → 구절 저장 화면으로 텍스트 전달\n\n**EXCEPTION**\n3. 인식된 단어 0개 → 구절 선택 버튼 비활성 유지\n\n### S-07 구절 저장\n\n**NORMAL**\n1. Tag 클릭 → selected 변경(active) → 이전 selected 자동 해제\n2. 저장하기 Button 클릭 → loading(\"저장 중...\") → 저장 완료 → loading 해제 → 홈 화면 이동\n\n**EXCEPTION**\n3. QuoteInput 비어있음 또는 DateInput 형식 오류 → 저장하기 Button 비활성\n4. QuoteInput에 내용을 입력하던 중 텍스트 추가 Button 클릭 → 카메라 화면으로 이동 → 뒤로 돌아와도 QuoteInput·DateInput·BookTitleInput·PageInput·Tag 선택 등 기존 입력값 그대로 유지\n\n### S-08 마이페이지\n\n1. TopBar 설정 아이콘 클릭 → 설정 화면(S-12) 이동\n2. Calendar 이전/다음 달 버튼 클릭 → currentMonth 변경 → 해당 월의 날짜별 태그색 점 다시 표시\n\n### S-12 설정\n\n1. SettingsRow 클릭 → 프로필 수정 / 태그 설정 / 이용약관 화면 이동\n2. LogoutText 클릭 → 확인 Modal 열림 → 확인 → 로그인 화면 이동\n\n### S-09 프로필 수정\n\n1. 화면 진입 → NicknameInput·BirthYearInput 기존 값으로 채움\n2. 저장하기 Button 클릭 → 수정 처리 → 마이페이지 복귀\n\n### S-10 태그 설정\n\n**NORMAL**\n1. AddTagButton 클릭 → 태그 추가 Modal에서 이름·색 입력 → 확인 → 태그 목록에 추가\n2. 태그 더보기 클릭 → 태그 옵션 Sheet 열림 → \"수정하기\" 선택 → 태그 수정 Modal → 확인 → 목록 반영\n\n**EXCEPTION**\n3. \"삭제하기\" 선택 → 삭제 확인 Modal → 확인 → 태그 삭제 + 연결된 구절에서도 자동 제거, 실패 시 오류 안내\n\n### S-11 이용약관\n\n1. 화면 진입 → Article 목록 표시(읽기 전용)\n\n---\n\n## 10. STATES TO QA\n\n필수 4상태(default / loading / success / empty)마다 화면이 **무엇을 보여줘야 하는지** 정의한다. QA는 이 정의를 기준으로 테스트 태스크를 구성한다.\n\n| 화면 | default | loading | success | empty |\n|------|---------|---------|---------|-------|\n| S-01 로그인 | 로고 + 슬로건 + 카카오 로그인 버튼 | 로그인 처리 중 버튼 비활성 | 신규 회원이면 온보딩, 기존 회원이면 홈 화면으로 즉시 이동 | 해당 없음 |\n| S-02 온보딩 | 닉네임·출생연도 입력창 + 약관 체크 3개 + 시작하기 버튼(비활성) | 시작하기 버튼 비활성 + 처리 중 | 가입 완료 후 홈 화면으로 이동 | 해당 없음 |\n| S-03 홈 타임라인 | 검색창 + 필터 칩(\"전체\") + 타임라인 | 중앙에 로딩 스피너 표시 | 구절이 시간순 타임라인 카드로 표시, 중앙 카드가 펼쳐짐 | 구절 0건: \"아직 저장한 구절이 없어요 / 첫 구절을 기록해 보세요\" + \"구절 기록하기\" 버튼 · 검색/필터 결과 0건: \"검색 결과가 없습니다\" |\n| S-04 구절 상세·메모 | 구절 전문 + 메모 입력창 | 해당 없음 | 메모 목록 시간순 표시 | 메모 0개일 때: 구절만 표시 |\n| S-05 카메라 | 카메라 프리뷰 + 촬영/갤러리/건너뛰기 버튼 | 촬영 영역 검은 화면 | 촬영·선택 성공 시 텍스트 선택 화면으로 즉시 전환 | 권한 미허용 상태를 별도 화면(권한 요청 안내 + \"권한 허용\" 버튼)으로 대체 표시 |\n| S-06 OCR 텍스트 선택 | 원본 사진 + \"텍스트 위로 드래그하여 선택\" 안내 | \"텍스트 인식 중...\" 스피너 | 인식된 단어를 드래그로 선택, \"사용하기\" 버튼 활성화 | 인식된 단어 0개일 때: \"텍스트를 인식하지 못했어요. 다시 촬영하거나 직접 입력해 주세요\" 안내 + \"사용하기\" 버튼 비활성 유지 |\n| S-07 구절 저장 | 빈 입력폼(신규) 또는 기존 값 채움(편집) | 저장 버튼 레이블이 \"저장 중...\"으로 바뀜 | 저장 완료 후 홈 화면으로 이동 | 구절 텍스트 미입력 시 저장 불가 |\n| S-08 마이페이지 | 프로필 카드 + 기록 캘린더 + 톱바 설정 아이콘 | 해당 없음 | 닉네임·출생연도 정상 표시, 캘린더에 날짜별 태그색 점 표시 | 이번 달 저장한 구절이 0건이어도 캘린더 자체는 항상 표시(점만 없음) |\n| S-09 프로필 수정 | 기존 닉네임·출생연도가 채워진 입력창 | 저장 버튼 비활성 + 처리 중 | 저장 완료 후 마이페이지로 복귀 | 해당 없음 |\n| S-10 태그 설정 | 태그 목록(기본 6개 + 사용자 추가) + 태그별 구절 수 | 해당 없음 | 태그 목록 정상 표시, 삭제/수정 즉시 반영 | 사용자 추가 태그가 0개여도 기본 6개가 항상 존재해 완전 empty는 발생하지 않음 |\n| S-11 이용약관 | 약관 조항 목록 표시 | 해당 없음 | 해당 없음 | 해당 없음 |\n| S-12 설정 | 설정 목록 + 앱 정보 목록 + 로그아웃 | 해당 없음 | 각 항목 정상 표시, 이메일·버전 정상 표시 | 해당 없음 |\n\n\n---\n\n## 11. CONSTRAINTS\n\n| 구분 | 값 |\n|------|-----|\n| 플랫폼 | 모바일(iOS/Android), Expo(SDK 56) + React Native |\n| 화면 크기 | 고정 프레임 390×844 (Figma 와이어프레임 기준), 컴포넌트 자체는 `w-full`/`flex-1`로 구현(고정 px 폭 금지) |\n| 언어 | TypeScript |\n| 스타일 | NativeWind(Tailwind v4) — 인라인 color 하드코딩 금지, 토큰 참조 필수 |\n| 라우팅 | Expo Router v4 (file-based) |\n| 인증 | Kakao Login → Firebase Custom Token |\n| 데이터베이스 | Firestore (`@react-native-firebase/firestore`) |\n| 카메라/OCR | `expo-camera` + `expo-image-picker` / `@react-native-ml-kit/text-recognition`(온디바이스, KOREAN) |\n| 주요 색상 | Ink Primary `#1A1A1A` · Surface Base `#FFFFFF` · Surface Card `#FAFAF9` · Border Default `#E8E8E6` · Feedback Error `#DC2626` · Feedback Success `#16A34A` |\n| 태그 팔레트 | Yellow `#FEF08A` · Red `#FECACA` · Green `#BBF7D0` · Blue `#BAE6FD` · Purple `#DDD6FE` · Orange `#FED7AA` |\n| 타이포그래피 | `NanumSquareRound`(본문) / `HambakSnow`(워드마크) |\n| 컴포넌트 구조 | 1컴포넌트 = 3파일(`.tsx` / `.types.ts` / `.styles.ts`) 예외 없음 |\n\n---\n\n## 12. NOTES — 지금은 이렇게 / 나중에 고칠 것\n\n> 이 표는 제품 개선 백로그다. \"패턴화\"(태그 기반 회고) 관련 리서치의 현재 진행 상황은 이 표가 아니라 `docs/UT_PLAN.md`가 최신 허브다. 완료된 항목의 구현 근거는 `docs/superpowers/specs/2026-07-15-improvement-roadmap-design.md` · `docs/superpowers/plans/2026-07-15-improvement-roadmap-plan.md` 참고.\n\n| 지금은 이렇게 했어요 (as-is) | 나중에 고쳐야 할 것 (to-be) | 상태 |\n|------------------------------|------------------------------|------|\n| OCR 인식 결과 0개일 때 버튼만 비활성화되고 안내 문구 없음 | \"텍스트를 인식하지 못했어요. 다시 촬영해 주세요\" 등 명시적 empty/error 안내 추가 | 🔜 미착수 |\n| 태그 0개일 때 문구 없음 | \"설정된 태그가 없습니다\" 안내 문구 추가 | ✅ 완료 (2026-07-16) |\n| 구절 저장·태그 추가 실패 시 사용자에게 에러 메시지 없이 조용히 원복 | 실패 안내 및 재시도 유도 | ✅ 완료 (2026-07-16) |\n| 책 제목 직접 입력으로 인해 오타 발생 가능 | 저장된 구절 목록 기준 책 제목 자동완성 | 🔜 미착수 |\n| 로컬/드라이브 백업 없음(Firestore 단일 저장) | 사용자 데이터 안정성 요구 증가 시 백업/이관 기능 검토 | ⏸ 보류 (범위 밖) |\n| Firebase Analytics 이벤트만 구현 | 배포 후 지표 트래킹 도구(Hotjar/Mixpanel 등) 연동 | ⏸ 보류 |\n| `tags` 컬렉션에 `updatedAt` 필드가 없어 태그 편집 횟수를 집계할 수 없음(생성만 `tag_created`로 추적) | 스키마에 `updatedAt` 추가해 태그 생성/편집 수를 함께 집계 | ✅ 완료 (2026-07-16) |\n| 실측 데이터가 없어 성공 지표를 가정 | 첫 지표 수집 결과로 보정 | 진행 중 — `docs/UT_PLAN.md` 참고 |\n| 핵심 지표를 \"구절 10개 도달\"(축적)으로 잡아, 정작 문제 정의인 \"재발견\"을 재는 지표가 없었음 | 핵심 지표를 구절 재발견률(20%→40%)로 교체하고 `quote_searched`·`quote_opened` 이벤트 신설 | ✅ 완료 (2026-07-25) — 코드 반영 완료, OTA 배포 후 첫 집계 필요 |\n| 마이페이지가 프로필+설정 목록으로만 구성돼 저장한 기록을 날짜로 돌아볼 방법이 없음 | 기록 캘린더 추가(S-08), 기존 설정/앱정보/로그아웃은 톱바 설정 아이콘 뒤 별도 화면(S-12)으로 분리 — Out of Scope \"태그 캘린더\" 보류 해제 | 🔜 진행 중 (2026-07-16) |\n"
  },
  {
    id: 'pawpal-petcare',
    title: 'PawPal 반려동물 케어 & 산책 앱 (테스트용)',
    badge: '신규',
    description: '반려동물 건강 케어, 실시간 GPS 산책 트래킹, 대시보드 UI를 검증하는 테스트 PRD입니다.',
    markdown: `# [PRD] PawPal - 반려동물 맞춤 건강 케어 & 산책 커뮤니티

## 1. 메인 산책 & 케어 대시보드 (Dashboard)

├─ MainDashboardLayout
│  - Props: petName="초코", breed="포메라니안", age="3세"
│  ├─ HeaderNavigation
│  │  - Props: appLogo, currentPetProfile, notificationBadgeCount=3
│  │  - Event: onClickProfile → 반려동물 프로필 전환 팝업
│  │  - Event: onClickNotification → 알림 센터 이동
│  ├─ DailyWalkSummaryCard
│  │  - Props: todayDistance="2.4km", todayDuration="45분", goalDistance="3.0km"
│  │  └─ StartWalkButton
│  │     - Props: label="산책 시작하기", icon="paw", color="#22C55E"
│  │     - Event: onClick → GPS 산책 트래킹 화면으로 이동
│  ├─ HealthScheduleWidget
│  │  - Props: upcomingVaccination="심장사상충 예방약", dueDate="D-3"
│  │  └─ AddScheduleButton
│  │     - Props: label="일정 추가", variant="ghost"
│  │     - Event: onClick → 케어 일정 등록 모달 노출
│  └─ CommunityActivityFeed
│     - Props: feedItemsCount=5, category="인근 산책 친구"
│     └─ FeedPostItem
│        - Props: author="마루보호자", petTag="골든리트리버", distance="400m 앞"
│        - Event: onClickLike → 응원 하트 수 증가
│        - Event: onClickComment → 댓글 팝업 열기

## 2. 산책 실시간 트래킹 화면 (Live Walk Tracking)

├─ WalkTrackingLayout
│  - Props: isGpsActive=true, mapZoomLevel=16
│  ├─ FullScreenMapView
│  │  - Props: currentLat, currentLng, walkRoutePolyline
│  │  └─ CurrentLocationMarker
│  │     - Props: petAvatarIcon, pulseAnimation=true
│  ├─ WalkStatsOverlayCard
│  │  - Props: timer="00:24:15", distance="1.82km", calories="142kcal"
│  │  ├─ PauseButton
│  │  │  - Props: state="PLAYING"
│  │  │  - Event: onClick → 일시정지 / 재개 토글
│  │  └─ StopButton
│  │     - Props: label="산책 종료", color="#EF4444"
│  │     - Event: onClickHold3Sec → 산책 기록 저장 및 요약 리포트 노출
│  └─ PhotoCaptureButton
│     - Props: icon="camera"
│     - Event: onClick → 산책 도중 인증샷 촬영 및 경로 등록

## 3. 기능 스펙 및 UI 구성 요약

| 화면 명 | 핵심 와이어프레임 컴포넌트 | 주요 이벤트 및 동작 |
| --- | --- | --- |
| 메인 대시보드 | \`DailyWalkSummaryCard\`, \`HealthScheduleWidget\` | 산책 시작, 프로필 전환, 일정 추가 |
| 산책 트래킹 | \`FullScreenMapView\`, \`WalkStatsOverlayCard\` | GPS 지도 기록, 산책 정지/종료, 사진 촬영 |
| 건강 관리 | \`WeightChartWidget\`, \`MedicalRecordList\` | 체중 일지 입력, 접종 기록 조회 |

- 반려동물의 건강 상태와 산책 목표를 실시간 시각화합니다.
- GPS 위치 기반으로 인근 **산책 친구**를 탐색할 수 있습니다.
- 백그라운드 위치 권한이 필수로 요청됩니다.
`
  }
];

