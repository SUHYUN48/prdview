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
    try {
      const { oldMarkdown, newMarkdown, diffSummary } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          success: true,
          source: 'local',
          briefing: 'AI 브리핑 API 키가 설정되지 않아 규칙 기반 요약을 제공합니다.\n' + (diffSummary || '변경사항이 감지되었습니다.')
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 IT 프로덕트 매니저를 돕는 AI 기획 보조 에이전트입니다.
사용자가 PRD(제품 요구사항 정의서) 마크다운을 수정했습니다.

[이전 PRD 요약/원문]:
${oldMarkdown ? oldMarkdown.slice(0, 3000) : '(없음 - 신규 작성)'}

[수정된 현재 PRD 원문]:
${newMarkdown ? newMarkdown.slice(0, 3000) : '(내용 없음)'}

[자동 분석된 구조 차이점]:
${JSON.stringify(diffSummary || {}, null, 2)}

다음 지침에 따라 1인 기획자가 변경 사항을 한눈에 파악할 수 있도록 'PRD 변경 사항 요약(Briefing)'을 한국어로 작성해주세요:
1. **주요 변경 화면/섹션**: 추가/수정/삭제된 화면이나 영역을 간결한 불릿으로 정리.
2. **와이어프레임 구조 변화**: 컴포넌트, Props, Event 속성의 주요 추가/수정 사항.
3. **기획 의도 및 영향도 시사점**: 1인 기획자가 개발 에이전트에게 전달할 때 유의할 핵심 포인트 1-2줄.
4. 불필요한 사족 없이 명확하고 신속하게 읽히도록 작성.
`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt
        });
      } catch (modelErr) {
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });
      }

      const text = response.text || '변경 사항 브리핑을 생성하지 못했습니다.';
      res.json({ success: true, source: 'gemini', briefing: text });
    } catch (err: any) {
      console.error('Gemini Briefing error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'AI 브리핑 생성 중 오류가 발생했습니다.'
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
