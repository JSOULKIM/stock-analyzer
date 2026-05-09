export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { ticker, term, depth, seed } = req.body;
  if (!ticker) return res.status(400).json({ error: '종목명을 입력해주세요.' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });

  const prompt = `당신은 골드만삭스 10년 경력 수석 애널리스트이자 국내 주식 단기 트레이딩 전문가입니다.

분석 종목: ${ticker}
투자 기간: ${term || '단기(1~5일)'}
분석 깊이: ${depth || '표준 분석'}
시드머니: ${seed || '100만원'}
분석 기준일: 오늘 (최신 정보 기준)

웹 검색으로 최신 정보를 수집한 뒤, 아래 형식으로 리포트를 작성하세요.
추상적 표현 금지 — 모든 가격은 원화로 구체적으로 제시. 초보 투자자도 이해할 수 있게.

## 1. 기업 개요 & 현재 주가
- 현재 주가 / 52주 고·저 / 시가총액
- 사업 구조 한 줄 요약

## 2. 경쟁력 & 리스크
- 핵심 강점 3가지 (수치 포함)
- 핵심 리스크 2가지
- 현 가격 매력도: X점/100점 (이유 포함)

## 3. 기술적 분석
- 현재 추세 (상승/하락/횡보)
- 지지선 / 저항선 (구체적 가격)
- 거래량 신호
- 추천 진입 타점

## 4. 매매 전략 (시드: ${seed || '100만원'})
- 1차 매수가 & 수량
- 익절 1구간 / 익절 2구간
- 손절 기준가 & 이유
- 리스크/리워드 비율

## 5. 수급 분석
- 외국인 / 기관 / 개인 최근 동향
- 구간 판단: 매집 / 분배 / 애매 (확률 %)

## 6. 핵심 요약
- 3줄 요약
- 초보자를 위한 한 줄 결론

출처 명시 (증권사 리포트명, 뉴스 날짜 포함).`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'API 오류' });
    }

    const data = await response.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    return res.status(200).json({ report: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
