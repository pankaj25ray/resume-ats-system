'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'https://resume-ats-backend-drnu.onrender.com/api/v1/resume';

/* ═══════════════════════════════════════
   SCORE DISTRIBUTION (from backend stats)
   ═══════════════════════════════════════ */
function ScoreDistribution({ distribution, total, animated }) {
  const ranges = [
    { label: '90-100', key: '90-100', color: '#0071E3' },
    { label: '80-89', key: '80-89', color: '#34C759' },
    { label: '70-79', key: '70-79', color: '#5AC8FA' },
    { label: '60-69', key: '60-69', color: '#FF9F0A' },
    { label: '50-59', key: '50-59', color: '#FF9500' },
    { label: '0-49', key: '0-49', color: '#FF3B30' },
  ];

  const counts = ranges.map(r => ({
    ...r,
    count: distribution ? (distribution[r.key] || 0) : 0
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {counts.map((r, i) => {
        const pct = (r.count / maxCount) * 100;
        return (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', width: 48, textAlign: 'right', flexShrink: 0 }}>{r.label}</span>
            <div style={{ flex: 1, height: 28, background: 'rgba(0,0,0,0.03)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: 8, background: r.color,
                width: animated ? `${Math.max(pct, r.count > 0 ? 12 : 0)}%` : '0%',
                transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`,
                display: 'flex', alignItems: 'center', paddingLeft: 10,
              }}>
                {r.count > 0 && pct > 25 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: '#fff' }}>{r.count}</span>}
              </div>
              {r.count > 0 && pct <= 25 && (
                <span style={{
                  position: 'absolute', left: `${Math.max(pct, 12) + 2}%`, top: '50%', transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: r.color
                }}>{r.count}</span>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 4 }}>
        Total: {total} resumes
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SCORE TREND (Bar chart - last 10)
   ═══════════════════════════════════════ */
function ScoreTrend({ history, animated }) {
  const recent = [...history].slice(0, 10).reverse();

  if (recent.length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center', padding: '60px 0' }}>No data yet</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, padding: '0 4px' }}>
        {recent.map((d, i) => {
          const height = Math.max((d.ats_score / 100) * 140, 8);
          const color = d.ats_score >= 80 ? '#34C759' : d.ats_score >= 60 ? '#0071E3' : d.ats_score >= 40 ? '#FF9F0A' : '#FF3B30';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: 'var(--text-primary)',
                opacity: animated ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.1 + 0.8}s`,
              }}>
                {d.ats_score}
              </span>
              <div style={{
                width: '100%', maxWidth: 36, borderRadius: '6px 6px 2px 2px',
                background: color,
                height: animated ? height : 0,
                transition: `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '8px 4px 0', borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 8 }}>
        {recent.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--text-tertiary)' }}>
              {d.created_at ? new Date(d.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : `#${i + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SCORE RING
   ═══════════════════════════════════════ */
function ScoreRing({ score, size = 120 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [ringAnimated, setRingAnimated] = useState(false);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#34C759' : score >= 60 ? '#0071E3' : score >= 40 ? '#FF9F0A' : '#FF3B30';

  useEffect(() => {
    if (score <= 0) return;
    const delay = setTimeout(() => {
      setRingAnimated(true);
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        if (current > score) {
          current = score;
          clearInterval(interval);
        }
        setDisplayScore(current);
      }, 18);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(delay);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="7" />
        <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={ringAnimated ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--text-primary)',
      }}>
        {displayScore}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   CATEGORY BARS
   ═══════════════════════════════════════ */
function CategoryBars({ breakdown, animated }) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)' }}>Upload a resume to see breakdown</p>;
  }
  const maxScores = { keyword_relevance: 25, formatting: 20, section_completeness: 15, quantification: 15, action_verbs: 10, grammar_clarity: 10, length_density: 5 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(breakdown).map(([key, value], i) => {
        const max = maxScores[key] || 10;
        const pct = (value / max) * 100;
        const color = pct >= 80 ? '#34C759' : pct >= 60 ? '#0071E3' : '#FF9F0A';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{value}/{max}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, background: color,
                width: animated ? `${pct}%` : '0%',
                transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   PERCENTILE GAUGE
   ═══════════════════════════════════════ */
function PercentileGauge({ percentile, animated }) {
  return (
    <div>
      <div style={{ height: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, #FF3B30 0%, #FF9F0A 30%, #34C759 70%, #0071E3 100%)',
          opacity: 0.2, borderRadius: 5,
        }} />
        <div style={{
          position: 'absolute', top: -3, width: 16, height: 16,
          borderRadius: '50%', background: '#0071E3',
          border: '3px solid #fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          left: animated ? `calc(${percentile}% - 8px)` : '0%',
          transition: 'left 1.5s cubic-bezier(0.4,0,0.2,1) 0.3s',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>0th</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>50th</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>100th</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════ */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/stats`),
          fetch(`${API_URL}/history`)
        ]);
        const statsData = await statsRes.json();
        const historyData = await historyRes.json();
        setStats(statsData);
        setHistory(historyData.history || []);
      } catch (err) {
        setError('Could not load data. Backend may be starting — try again in 30 seconds.');
      } finally {
        setLoading(false);
        setTimeout(() => setPageReady(true), 300);
      }
    }
    fetchData();
  }, []);

  const latestScore = history.length > 0 ? history[0].ats_score : 0;
  const totalResumes = stats?.total_resumes || 0;
  const avgScore = stats?.average_score || 0;
  const highestScore = stats?.highest_score || 0;
  const lowestScore = stats?.lowest_score || 0;
  const percentile = totalResumes > 0 ? Math.min(Math.round((latestScore / 100) * 100), 99) : 0;
  const latestBreakdown = history.length > 0 ? history[0].score_breakdown : null;

  // Use backend stats for accurate counts across ALL resumes
  const dist = stats?.score_distribution || {};
  const above80 = (dist['90-100'] || 0) + (dist['80-89'] || 0);
  const between60and80 = (dist['70-79'] || 0) + (dist['60-69'] || 0);
  const below60 = (dist['50-59'] || 0) + (dist['0-49'] || 0);

  const allBreakdowns = history.filter(h => h.score_breakdown && Object.keys(h.score_breakdown).length > 0);
  const avgBreakdown = {};
  if (allBreakdowns.length > 0) {
    const keys = Object.keys(allBreakdowns[0].score_breakdown);
    keys.forEach(key => {
      const sum = allBreakdowns.reduce((acc, h) => acc + (h.score_breakdown[key] || 0), 0);
      avgBreakdown[key] = Math.round(sum / allBreakdowns.length);
    });
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        <Navbar />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 20px', border: '3px solid rgba(0,113,227,0.12)', borderTopColor: '#0071E3', animation: 'spin 1.2s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '120px 24px 80px' }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: '#0071E3', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Dashboard</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, letterSpacing: -1, marginBottom: 8 }}>Resume analytics</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)' }}>{totalResumes} resumes analyzed — all data is anonymous</p>
        </div>

        {error && (
          <div style={{ padding: '16px 20px', marginBottom: 24, background: 'rgba(255,159,10,0.06)', border: '0.5px solid rgba(255,159,10,0.15)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, color: '#FF9F0A' }}>{error}</div>
        )}

        {/* Row 1 — Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Latest score', value: `${latestScore}`, sub: 'out of 100', color: '#0071E3' },
            { label: 'Average', value: `${avgScore}`, sub: 'all resumes', color: '#AF52DE' },
            { label: 'Highest', value: `${highestScore}`, sub: 'best score', color: '#34C759' },
            { label: 'Lowest', value: `${lowestScore}`, sub: 'weakest', color: '#FF3B30' },
            { label: 'Total', value: `${totalResumes}`, sub: 'resumes', color: '#FF9F0A' },
          ].map((s, i) => (
            <div key={s.label} className="animate-fade-up" style={{
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: '20px',
              animationDelay: `${0.1 + i * 0.08}s`, transition: 'all 0.3s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Row 2 — Ring + Distribution + Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1.5fr', gap: 20, marginBottom: 20 }}>
          {/* Score Ring */}
          <div className="animate-fade-up stagger-2" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Latest score</div>
            {pageReady && <ScoreRing score={latestScore} size={130} />}
            {!pageReady && <div style={{ width: 130, height: 130 }} />}
            <div style={{
              marginTop: 14, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
              color: latestScore >= 80 ? '#34C759' : latestScore >= 60 ? '#0071E3' : '#FF9F0A',
              background: latestScore >= 80 ? 'rgba(52,199,89,0.08)' : latestScore >= 60 ? 'rgba(0,113,227,0.08)' : 'rgba(255,159,10,0.08)',
              padding: '5px 14px', borderRadius: 20,
            }}>
              {latestScore >= 80 ? 'Excellent' : latestScore >= 60 ? 'Average' : 'Needs work'}
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="animate-fade-up stagger-3" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '24px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Quality distribution</h3>
            {[
              { label: 'Excellent (80+)', count: above80, color: '#34C759' },
              { label: 'Average (60-79)', count: between60and80, color: '#0071E3' },
              { label: 'Needs work (<60)', count: below60, color: '#FF3B30' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500, color: item.color }}>{item.count}</span>
              </div>
            ))}
            <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 8, gap: 2 }}>
              {above80 > 0 && <div style={{ flex: above80, background: '#34C759', borderRadius: 5 }} />}
              {between60and80 > 0 && <div style={{ flex: between60and80, background: '#0071E3', borderRadius: 5 }} />}
              {below60 > 0 && <div style={{ flex: below60, background: '#FF3B30', borderRadius: 5 }} />}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
              {totalResumes > 0 ? `${Math.round((above80 / totalResumes) * 100)}% score 80+` : ''}
            </div>
          </div>

          {/* Score Trend */}
          <div className="animate-fade-up stagger-4" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '24px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Score trend (last 10)</h3>
            {pageReady && <ScoreTrend history={history} animated={pageReady} />}
            {!pageReady && <div style={{ height: 160 }} />}
          </div>
        </div>

        {/* Row 3 — Distribution + Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="animate-fade-up stagger-5" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Score distribution</h3>
            <ScoreDistribution distribution={stats?.score_distribution} total={totalResumes} animated={pageReady} />
          </div>

          <div className="animate-fade-up stagger-6" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Average category scores</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>Across {allBreakdowns.length} resumes</p>
            <CategoryBars breakdown={Object.keys(avgBreakdown).length > 0 ? avgBreakdown : latestBreakdown} animated={pageReady} />
          </div>
        </div>

        {/* Row 4 — Percentile + Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="animate-fade-up stagger-7" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Percentile ranking</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
              {totalResumes > 0 ? `Latest score ranks in the ${percentile}th percentile.` : 'Upload a resume to see ranking.'}
            </p>
            <PercentileGauge percentile={percentile} animated={pageReady} />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: '#0071E3' }}>{percentile}th</span>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>percentile</div>
            </div>
          </div>

          <div className="animate-fade-up stagger-8" style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Key insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '14px 16px', background: 'rgba(0,113,227,0.04)', borderRadius: 12 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#0071E3', marginBottom: 4 }}>Score range</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Scores range from {lowestScore} to {highestScore} — a spread of {highestScore - lowestScore} points
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(52,199,89,0.04)', borderRadius: 12 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#34C759', marginBottom: 4 }}>Success rate</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {totalResumes > 0 ? Math.round((above80 / totalResumes) * 100) : 0}% of resumes are ATS-ready with score 80+
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(255,159,10,0.04)', borderRadius: 12 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#FF9F0A', marginBottom: 4 }}>Recommendation</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Add measurable achievements with numbers to boost scores by 10-15 points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div style={{ textAlign: 'center', marginTop: 32, padding: '16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            All data is anonymous — no personal information is displayed
          </p>
        </div>
      </div>
    </main>
  );
}