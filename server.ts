import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'PRDView' });
  });

  // AI Briefing Endpoint
  app.post('/api/briefing', async (req, res) => {
    const { oldMarkdown, newMarkdown, diffSummary } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const isSameMarkdown = (oldMarkdown || '').trim() === (newMarkdown || '').trim();
    const isNoDiff = !diffSummary ||
      (typeof diffSummary === 'string' &&
        (diffSummary.includes('이전 버전과 동일합니다') ||
         diffSummary.includes('감지된 기획 변경 사항이 없습니다') ||
         diffSummary.trim() === ''));

    // 정말로 변경 사항이 없는 경우 -> 미사여구 없이 단 한 줄로만 안내
    if (isSameMarkdown && isNoDiff) {
      return res.json({
        success: true,
        source: 'local',
        briefing: '변경사항이 없습니다.'
      });
    }

    // 변경 사항이 존재하는 경우의 스마트 기본 요약 생성 함수
    const generateLocalBriefing = () => {
      let briefingText = `📋 [PRD 변경 사항 스마트 요약]\n\n`;
      briefingText += `${diffSummary || '• PRD 내용 및 와이어프레임 구조 변경 사항이 감지되었습니다.'}\n\n`;
      briefingText += `💡 **개발 유의사항**: 와이어프레임 화면 ID 및 컴포넌트 Props 동기화 상태를 점검하세요.`;
      return briefingText;
    };

    const isValidApiKey = apiKey && apiKey.trim() !== '';
    if (!apiKey || !isValidApiKey) {
      return res.json({
        success: true,
        source: 'local',
        briefing: generateLocalBriefing()
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 IT 프로덕트 매니저를 돕는 AI 기획 보조 에이전트입니다.
사용자가 PRD(제품 요구사항 정의서) 마크다운을 수정했습니다.

[이전 PRD 원문]:
${oldMarkdown ? oldMarkdown.slice(0, 3000) : '(없음 - 신규 작성)'}

[수정된 현재 PRD 원문]:
${newMarkdown ? newMarkdown.slice(0, 3000) : '(내용 없음)'}

[분석된 변경 사항]:
${typeof diffSummary === 'string' ? diffSummary : JSON.stringify(diffSummary || {}, null, 2)}

다음 지침에 따라 1인 기획자가 변경 사항을 한눈에 파악할 수 있도록 변경된 내용을 핵심만 명확히 한국어로 요약해 주세요:
1. 추가/수정/삭제된 화면 및 와이어프레임 컴포넌트 박스/텍스트를 간결하게 정리.
2. 서론이나 불필요한 사족 없이 변경된 핵심 내용만 불릿으로 작성.
`;

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let responseText: string | null = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`[Gemini API] Trying model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt
          });
          if (response && response.text) {
            responseText = response.text;
            console.log(`[Gemini API] Success with model: ${modelName}`);
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.error(`[Gemini API Error - ${modelName}]:`, mErr?.message || mErr);
        }
      }

      if (responseText) {
        return res.json({ success: true, source: 'gemini', briefing: responseText });
      }

      console.error('[Gemini API] All models failed. Last error:', lastError?.message || lastError);
      return res.json({
        success: true,
        source: 'fallback',
        briefing: generateLocalBriefing()
      });
    } catch (err: any) {
      console.error('[Gemini Server Error]:', err?.message || err);
      return res.json({
        success: true,
        source: 'fallback',
        briefing: generateLocalBriefing()
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PRDView] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
