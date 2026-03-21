'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'https://resume-ats-backend-drnu.onrender.com/api/v1/resume';

/* ═══════════════════════════════════════
   REVEAL HOOK
   ═══════════════════════════════════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ═══════════════════════════════════════
   SCORE DISTRIBUTION (Horizontal bars)
   ═══════════════════════════════════════ */
function ScoreDistribution({ history, animated }) {
  const ranges = [
    { label: '90-100', min: 90, max: 100, color: '#0071E3' },
    { label: '80-89', min: 80, max: 89, color: 'var(--green)' },
    { label: '70-79', min: 70, max: 79, color: '#5AC8FA' },
    { label: '60-69', min: 60, max: 69, color: 'var(--amber)' },
    { label: '50-59', min: 50, max: 59, color: '#FF9500' },
    { label: '0-49', min: 0, max: 49, color: 'var(--red)' },
  ];
  const counts = ranges.map(r => ({
    ...r,
    count: history.filter(h => h.ats_score >= r.min && h.ats_score <= r.max).length
  }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {counts.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', width: 45, textAlign: 'right' }}>{r.label}</span>
          <div style={{ flex: 1, height: 24, background: 'rgba(0,0,0,0.03)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6, background: r.color,
              width: animated ? `${(r.count / maxCount) * 100}%` : '0%',
              transition: `width 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
              minWidth: r.count > 0 ? 24 : 0,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
            }}>
              {r.count > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: '#fff' }}>{r.count}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   SCORE TREND (Line-style dots)
   ═══════════════════════════════════════ */
function ScoreTrend({ history, animated }) {
  const recent = [...history].slice(0, 10).reverse();
  if (recent.length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>No data yet — upload resumes to see trends</p>;
  }

  const maxScore = 100;
  const minScore = 0;
  const chartHeight = 160;
  const chartWidth = 100;

  return (
    <div style={{ position: 'relative', height: chartHeight + 40, padding: '0 8px' }}>
      {/* Grid lines */}
      {[100, 80, 60, 40, 20].map(line => {
        const y = chartHeight - ((line - minScore) / (maxScore - minScore)) * chartHeight;
        return (
          <div key={line} style={{ position: 'absolute', top: y, left: 30, right: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-tertiary)', width: 20, textAlign: 'right' }}>{line}</span>
            <div style={{ flex: 1, height: 0.5, background: 'rgba(0,0,0,0.06)' }} />
          </div>
        );
      })}

      {/* Dots and connecting lines */}
      <svg style={{ position: 'absolute', top: 0, left: 50, right: 0, height: chartHeight }} viewBox={`0 0 ${recent.length * 50} ${chartHeight}`} preserveAspectRatio="none">
        {recent.map((d, i) => {
          if (i === 0) return null;
          const prevY = chartHeight - ((recent[i-1].ats_score / maxScore) * chartHeight);
          const currY = chartHeight - ((d.ats_score / maxScore) * chartHeight);
          const prevX = (i - 1) * 50 + 25;
          const currX = i * 50 + 25;
          return (
            <line key={`line-${i}`} x1={prevX} y1={prevY} x2={currX} y2={currY}
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
              opacity={animated ? 0.3 : 0}
              style={{ transition: `opacity 0.5s ease ${i * 0.1}s` }}
            />
          );
        })}
        {recent.map((d, i) => {
          const y = chartHeight - ((d.ats_score / maxScore) * chartHeight);
          const x = i * 50 + 25;
          const color = d.ats_score >= 80 ? 'var(--green)' : d.ats_score >= 60 ? 'var(--accent)' : 'var(--amber)';
          return (
            <g key={`dot-${i}`}>
              <circle cx={x} cy={y} r={animated ? 6 : 0} fill={color}
                style={{ transition: `r 0.4s ease ${i * 0.1}s` }}
              />
              <text x={x} y={y - 12} textAnchor="middle"
                style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, fill: 'var(--text-primary)',
                  opacity: animated ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.1 + 0.2}s` }}
              >{d.ats_score}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════
   MINI SCORE RING
   ═══════════════════════════════════════ */
function MiniScoreRing({ score, size = 120, animated }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--accent)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 1, score);
      setDisplayScore(current);
      if (current >= score) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [animated, score]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="7" />
        <circle cx="50" cy="50" r="36" fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500,
      }}>
        {displayScore}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   CATEGORY BREAKDOWN BARS
   ═══════════════════════════════════════ */
function CategoryBars({ breakdown, animated }) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)' }}>Upload a new resume to see breakdown</p>;
  }
  const maxScores = { keyword_relevance: 25, formatting: 20, section_completeness: 15, quantification: 15, action_verbs: 10, grammar_clarity: 10, length_density: 5 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(breakdown).map(([key, value], i) => {
        const max = maxScores[key] || 10;
        const pct = (value / max) * 100;
        const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--accent)' : 'var(--amber)';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{value}/{max}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, background: color,
                width: animated ? `${pct}%` : '0%',
                transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`,
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
    <div style={{ position: 'relative' }}>
      <div style={{ height: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, var(--red) 0%, var(--amber) 30%, var(--green) 70%, var(--accent) 100%)',
          opacity: 0.2, borderRadius: 4,
        }} />
        <div style={{
          position: 'absolute', top: -4, width: 16, height: 16,
          borderRadius: '50%', background: 'var(--accent)',
          border: '3px solid var(--surface-card)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          left: animated ? `calc(${percentile}% - 8px)` : '0%',
          transition: 'left 1.5s cubic-bezier(0.4,0,0.2,1)',
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
  const [ref, visible] = useReveal(0.1);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const above80 = history.filter(h => h.ats_score >= 80).length;
  const between60and80 = history.filter(h => h.ats_score >= 60 && h.ats_score < 80).length;
  const below60 = history.filter(h => h.ats_score < 60).length;

  // Calculate average per category from all resumes that have breakdown
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
          <div style={{
            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 20px',
            border: '3px solid rgba(0,113,227,0.12)', borderTopColor: 'var(--accent)',
            animation: 'spin 1.2s linear infinite',
          }} />
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
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, letterSpacing: -1, marginBottom: 8 }}>
            Resume analytics
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)' }}>
            {totalResumes} resumes analyzed — all data is anonymous
          </p>
        </div>

        {error && (
          <div style={{ padding: '16px 20px', marginBottom: 24, background: 'rgba(255,159,10,0.06)', border: '0.5px solid rgba(255,159,10,0.15)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--amber)' }}>
            {error}
          </div>
        )}

        {/* Row 1 — Key Metrics */}
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Latest score', value: `${latestScore}`, sublabel: 'out of 100', color: 'var(--accent)' },
            { label: 'Average', value: `${avgScore}`, sublabel: 'all resumes', color: 'var(--purple)' },
            { label: 'Highest', value: `${highestScore}`, sublabel: 'best score', color: 'var(--green)' },
            { label: 'Lowest', value: `${lowestScore}`, sublabel: 'weakest score', color: 'var(--red)' },
            { label: 'Total', value: `${totalResumes}`, sublabel: 'resumes', color: 'var(--amber)' },
          ].map((stat, i) => (
            <div key={stat.label} className="animate-fade-up" style={{
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              animationDelay: `${0.1 + i * 0.08}s`, transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: stat.color, letterSpacing: -0.5 }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Row 2 — Score Ring + Quality Distribution + Score Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1.5fr', gap: 20, marginBottom: 20 }}>
          {/* Latest Score Ring */}
          <div className="animate-fade-up stagger-2" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Latest score</div>
            <MiniScoreRing score={latestScore} size={120} animated={visible} />
            <div style={{
              marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
              color: latestScore >= 80 ? 'var(--green)' : latestScore >= 60 ? 'var(--accent)' : 'var(--amber)',
              background: latestScore >= 80 ? 'rgba(52,199,89,0.08)' : latestScore >= 60 ? 'rgba(0,113,227,0.08)' : 'rgba(255,159,10,0.08)',
              padding: '4px 12px', borderRadius: 20,
            }}>
              {latestScore >= 80 ? 'Excellent' : latestScore >= 60 ? 'Average' : 'Needs work'}
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="animate-fade-up stagger-3" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '24px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Quality distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Excellent (80+)', count: above80, color: 'var(--green)' },
                { label: 'Average (60-79)', count: between60and80, color: 'var(--accent)' },
                { label: 'Needs work (<60)', count: below60, color: 'var(--red)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 16, gap: 2 }}>
              {above80 > 0 && <div style={{ flex: above80, background: 'var(--green)', borderRadius: 4 }} />}
              {between60and80 > 0 && <div style={{ flex: between60and80, background: 'var(--accent)', borderRadius: 4 }} />}
              {below60 > 0 && <div style={{ flex: below60, background: 'var(--red)', borderRadius: 4 }} />}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
              {totalResumes > 0 ? `${Math.round((above80 / totalResumes) * 100)}% of resumes score 80+` : ''}
            </div>
          </div>

          {/* Score Trend (replaces Recent Scores) */}
          <div className="animate-fade-up stagger-4" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '24px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Score trend (last 10)</h3>
            <ScoreTrend history={history} animated={visible} />
          </div>
        </div>

        {/* Row 3 — Score Distribution + Average Category Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="animate-fade-up stagger-5" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Score distribution</h3>
            <ScoreDistribution history={history} animated={visible} />
          </div>

          <div className="animate-fade-up stagger-6" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Average category scores</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>Across all {allBreakdowns.length} resumes with breakdown data</p>
            <CategoryBars breakdown={Object.keys(avgBreakdown).length > 0 ? avgBreakdown : latestBreakdown} animated={visible} />
          </div>
        </div>

        {/* Row 4 — Percentile + Key Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="animate-fade-up stagger-7" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Percentile ranking</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
              {totalResumes > 0 ? `Latest score ranks in the ${percentile}th percentile.` : 'Upload a resume to see ranking.'}
            </p>
            <PercentileGauge percentile={percentile} animated={visible} />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: 'var(--accent)' }}>{percentile}th</span>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>percentile</div>
            </div>
          </div>

          <div className="animate-fade-up stagger-8" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Key insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px', background: 'rgba(0,113,227,0.04)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--accent)', marginBottom: 4 }}>Score range</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Scores range from {lowestScore} to {highestScore}, with a spread of {highestScore - lowestScore} points
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(52,199,89,0.04)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--green)', marginBottom: 4 }}>Success rate</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {totalResumes > 0 ? Math.round((above80 / totalResumes) * 100) : 0}% of resumes are ATS-ready (score 80+)
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(255,159,10,0.04)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--amber)', marginBottom: 4 }}>Top recommendation</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Add measurable achievements with numbers to boost scores by 10-15 points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{ textAlign: 'center', marginTop: 32, padding: '16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            All data is anonymous — no personal information is displayed
          </p>
        </div>
      </div>
    </main>
  );
}