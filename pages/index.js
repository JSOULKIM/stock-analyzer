import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const PRESETS = ['삼성전자', 'SK하이닉스', 'LG씨엔에스', '카카오', 'NAVER', '현대차', '셀트리온'];

function parseReport(text) {
  const sections = [];
  const lines = text.split('\n');
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.replace('## ', ''), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

function SectionCard({ title, lines, index }) {
  const icons = ['🏢', '⚡', '📊', '💰', '🔍', '✅'];
  const icon = icons[index] || '📌';
  return (
    <div className="section-card" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="section-header">
        <span className="section-icon">{icon}</span>
        <h3 className="section-title">{title}</h3>
      </div>
      <div className="section-body">
        {lines.map((line, i) => {
          if (!line.trim()) return null;
          const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          const isItem = line.startsWith('- ');
          if (isItem) {
            return (
              <div key={i} className="list-item"
                dangerouslySetInnerHTML={{ __html: '· ' + bold.replace(/^- /, '') }} />
            );
          }
          return (
            <p key={i} className="body-line"
              dangerouslySetInnerHTML={{ __html: bold }} />
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [term, setTerm] = useState('단기(1~5일)');
  const [depth, setDepth] = useState('표준 분석');
  const [seed, setSeed] = useState('100만원');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [recent, setRecent] = useState([]);
  const reportRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recent_tickers') || '[]');
      setRecent(saved);
    } catch {}
  }, []);

  const saveRecent = (name) => {
    const updated = [name, ...recent.filter(x => x !== name)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recent_tickers', JSON.stringify(updated));
  };

  const steps = [
    '실시간 주가 및 뉴스 검색 중...',
    '재무 데이터 & 증권사 리포트 수집 중...',
    '기술적 지표 & 수급 분석 중...',
    'AI 트레이딩 전략 설계 중...',
    '리포트 작성 완료 중...',
  ];

  const analyze = async (name) => {
    const target = name || ticker;
    if (!target.trim()) return;
    setLoading(true);
    setError('');
    setReport(null);
    setTicker(target);

    let si = 0;
    setStatus(steps[0]);
    const timer = setInterval(() => {
      si = (si + 1) % steps.length;
      setStatus(steps[si]);
    }, 3000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: target, term, depth, seed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setReport(data.report);
      saveRecent(target);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      clearInterval(timer);
      setLoading(false);
      setStatus('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(report || '');
  };

  const sections = report ? parseReport(report) : [];

  return (
    <>
      <Head>
        <title>한국 주식 AI 분석기</title>
        <meta name="description" content="종목명 입력 → AI가 실시간 분석 리포트 생성" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {/* 배경 효과 */}
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-glow" aria-hidden="true" />

        <main className="main">
          {/* 헤더 */}
          <header className="header">
            <div className="logo-mark">AI</div>
            <div>
              <h1 className="title">한국 주식 분석기</h1>
              <p className="subtitle">종목명 또는 종목코드 입력 → AI 실시간 트레이딩 리포트 생성</p>
            </div>
          </header>

          {/* 입력 영역 */}
          <div className="input-section">
            <div className="input-row">
              <input
                className="ticker-input"
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyze()}
                placeholder="예: 삼성전자 / 005930 / LG씨엔에스"
                disabled={loading}
                autoFocus
              />
              <button className="btn-analyze" onClick={() => analyze()} disabled={loading || !ticker.trim()}>
                {loading ? <span className="btn-spinner" /> : '분석 ↗'}
              </button>
            </div>

            {/* 프리셋 */}
            <div className="chips">
              {PRESETS.map(p => (
                <button key={p} className="chip" onClick={() => analyze(p)} disabled={loading}>{p}</button>
              ))}
            </div>

            {recent.length > 0 && (
              <div className="recent-row">
                <span className="recent-label">최근:</span>
                {recent.map(r => (
                  <button key={r} className="recent-chip" onClick={() => analyze(r)} disabled={loading}>{r}</button>
                ))}
              </div>
            )}

            {/* 옵션 */}
            <div className="opts">
              <div className="opt-group">
                <label className="opt-label">투자 기간</label>
                <select className="opt-sel" value={term} onChange={e => setTerm(e.target.value)}>
                  <option>단기(1~5일)</option>
                  <option>스윙(1~2주)</option>
                  <option>중기(1~3개월)</option>
                </select>
              </div>
              <div className="opt-group">
                <label className="opt-label">분석 깊이</label>
                <select className="opt-sel" value={depth} onChange={e => setDepth(e.target.value)}>
                  <option>핵심 요약</option>
                  <option>표준 분석</option>
                  <option>심층 분석</option>
                </select>
              </div>
              <div className="opt-group">
                <label className="opt-label">시드머니</label>
                <select className="opt-sel" value={seed} onChange={e => setSeed(e.target.value)}>
                  <option>50만원</option>
                  <option>100만원</option>
                  <option>500만원</option>
                  <option>1000만원</option>
                </select>
              </div>
            </div>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="status-bar">
              <div className="status-dot" />
              <span>{status}</span>
            </div>
          )}

          {/* 오류 */}
          {error && (
            <div className="error-box">⚠ {error}</div>
          )}

          {/* 리포트 */}
          {report && (
            <div className="report" ref={reportRef}>
              <div className="report-topbar">
                <div className="report-ticker-badge">{ticker}</div>
                <div className="report-meta-tags">
                  <span className="meta-tag">{term}</span>
                  <span className="meta-tag">{seed}</span>
                  <span className="meta-tag">{new Date().toLocaleDateString('ko-KR')}</span>
                </div>
                <button className="btn-copy" onClick={copy}>복사</button>
              </div>

              <div className="sections">
                {sections.map((s, i) => (
                  <SectionCard key={i} title={s.title} lines={s.lines} index={i} />
                ))}
                {sections.length === 0 && (
                  <div className="raw-text">{report}</div>
                )}
              </div>

              <p className="disclaimer">
                ※ 본 분석은 AI가 공개 정보를 기반으로 생성한 참고 자료이며 투자 권유가 아닙니다. 투자 판단 및 책임은 본인에게 있습니다.
              </p>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body {
          font-family: 'Noto Sans KR', sans-serif;
          background: #0a0e1a;
          color: #e2e8f0;
          min-height: 100vh;
        }

        .page { position: relative; min-height: 100vh; overflow: hidden; }

        .bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(30,200,120,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,200,120,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .bg-glow {
          position: fixed; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 500px; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%);
        }

        .main {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto; padding: 3rem 1.25rem 4rem;
        }

        .header {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 2.5rem;
        }
        .logo-mark {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700;
          color: #fff; flex-shrink: 0; letter-spacing: -1px;
        }
        .title {
          font-size: 22px; font-weight: 700; color: #f0fdf4;
          letter-spacing: -0.5px;
        }
        .subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }

        .input-section {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(30,200,120,0.15);
          border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;
          backdrop-filter: blur(8px);
        }
        .input-row { display: flex; gap: 10px; margin-bottom: 14px; }
        .ticker-input {
          flex: 1; height: 46px; padding: 0 16px; font-size: 15px;
          font-family: 'Noto Sans KR', sans-serif;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #e2e8f0; outline: none;
          transition: border-color 0.2s;
        }
        .ticker-input::placeholder { color: #475569; }
        .ticker-input:focus { border-color: rgba(16,185,129,0.5); }
        .ticker-input:disabled { opacity: 0.5; }

        .btn-analyze {
          height: 46px; padding: 0 24px; border-radius: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; white-space: nowrap;
          transition: opacity 0.2s, transform 0.1s;
          display: flex; align-items: center; gap: 6px;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .btn-analyze:hover:not(:disabled) { opacity: 0.9; }
        .btn-analyze:active:not(:disabled) { transform: scale(0.97); }
        .btn-analyze:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .chip {
          padding: 5px 13px; font-size: 12px; border-radius: 20px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; cursor: pointer; transition: all 0.15s;
          font-family: 'Noto Sans KR', sans-serif;
        }
        .chip:hover:not(:disabled) {
          background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.3);
          color: #10b981;
        }
        .chip:disabled { opacity: 0.4; cursor: not-allowed; }

        .recent-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .recent-label { font-size: 11px; color: #475569; }
        .recent-chip {
          font-size: 11px; padding: 3px 10px; border-radius: 12px;
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
          color: #10b981; cursor: pointer; font-family: 'Noto Sans KR', sans-serif;
        }
        .recent-chip:hover:not(:disabled) { background: rgba(16,185,129,0.15); }

        .opts { display: flex; gap: 12px; flex-wrap: wrap; }
        .opt-group { display: flex; flex-direction: column; gap: 5px; }
        .opt-label { font-size: 11px; color: #64748b; font-weight: 500; }
        .opt-sel {
          height: 34px; padding: 0 10px; font-size: 13px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1; outline: none; font-family: 'Noto Sans KR', sans-serif;
        }

        .status-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.15); border-radius: 10px;
          font-size: 13px; color: #10b981; margin-bottom: 1rem;
        }
        .status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10b981; animation: pulse 1.2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }

        .error-box {
          padding: 12px 16px; background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
          font-size: 13px; color: #f87171; margin-bottom: 1rem;
        }

        .report {
          background: rgba(15,23,42,0.7); border: 1px solid rgba(30,200,120,0.12);
          border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(8px);
        }
        .report-topbar {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          margin-bottom: 1.5rem; padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .report-ticker-badge {
          font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700;
          color: #10b981; background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25); border-radius: 8px;
          padding: 4px 12px;
        }
        .report-meta-tags { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
        .meta-tag {
          font-size: 11px; padding: 3px 10px; border-radius: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          color: #64748b;
        }
        .btn-copy {
          height: 30px; padding: 0 14px; font-size: 12px; border-radius: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; cursor: pointer; font-family: 'Noto Sans KR', sans-serif;
        }
        .btn-copy:hover { background: rgba(255,255,255,0.08); }

        .sections { display: flex; flex-direction: column; gap: 12px; }

        .section-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 1rem 1.25rem;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
        }
        .section-icon { font-size: 16px; }
        .section-title {
          font-size: 14px; font-weight: 700; color: #e2e8f0; letter-spacing: -0.3px;
        }
        .section-body { }
        .list-item {
          font-size: 13px; color: #94a3b8; padding: 3px 0 3px 8px;
          border-left: 2px solid rgba(16,185,129,0.2); margin: 4px 0;
          line-height: 1.7;
        }
        .list-item strong { color: #cbd5e1; font-weight: 600; }
        .body-line { font-size: 13px; color: #94a3b8; line-height: 1.7; margin: 4px 0; }
        .body-line strong { color: #cbd5e1; font-weight: 600; }
        .raw-text { font-size: 13px; color: #94a3b8; line-height: 1.8; white-space: pre-wrap; }

        .disclaimer {
          font-size: 11px; color: #334155; line-height: 1.6;
          margin-top: 1.25rem; padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        @media (max-width: 600px) {
          .main { padding: 1.5rem 1rem 3rem; }
          .opts { gap: 8px; }
          .input-row { flex-direction: column; }
          .btn-analyze { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
