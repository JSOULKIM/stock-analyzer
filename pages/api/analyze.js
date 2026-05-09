export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { ticker, term, depth, seed } = req.body;
  if (!ticker) return res.status(400).json({ error: '종목명을 입력해주세요.' });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const prompt = `당신은 골드만삭스 10년 경력 수석 애널리스트이자 국내 주식 단기 트레이딩 전문가입니다.\n\n분석 종목: ${ticker}\n투자 기간: ${term || '단기(1~5일)'}\n분석 깊이: ${depth || '표준 분석'}\n시드머니: ${seed || '100만원'}\n분석 기준일: ${today}\n\n아래 형식으로 트레이딩 분석 리포트를 작성하세요.\n추상적 표현 금지, 모든 가격은 원화로 구체적으로 제시.\n\n## 1. 기업 개요 & 현재 주가\n- 최근 주가 수준 / 52주 고·저 / 시가총액\n- 사업 구조 한 줄 요약\n\n## 2. 경쟁력 & 리스크\n- 핵심 강점 3가지 (수치 포함)\n- 핵심 리스크 2가지\n- 현 가격 매력도: X점/100점 (이유 포함)\n\n## 3. 기술적 분석\n- 현재 추세 (상승/하락/횡보)\n- 지지선 / 저항선 (구체적 가격)\n- 거래량 신호\n- 추천 진입 타점\n\n## 4. 매매 전략 (시드: ${seed || '100만원'})\n- 1차 매수가 & 수량\n- 익절 1구간 / 익절 2구간\n- 손절 기준가 & 이유\n- 리스크/리워드 비율\n\n## 5. 수급 분석\n- 외국인 / 기관 / 개인 최근 동향\n- 구간 판단: 매집 / 분배 / 애매 (확률 %)\n\n## 6. 핵심 요약\n- 3줄 요약\n- 초보자를 위한 한 줄 결론`;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: '당신은 한국 주식 시장 전문 애널리스트입니다. 항상 한국어로 답변하며, 구체적인 수치와 근거를 바탕으로 분석합니다.' },
          { role: 'user', content: prompt }
        ],
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'API 오류' });
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) return res.status(500).json({ error: '응답을 받지 못했습니다.' });
    return res.status(200).json({ report: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
