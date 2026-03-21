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
   BAR CHART
   ═══════════════════════════════════════ */
function BarChart({ data, animated }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)' }}>No data yet — upload a resume to see scores</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, padding: '0 8px' }}>
      {data.map((d, i) => {
        const height = (d.ats_score / 100) * 160;
        const color = d.ats_score >= 80 ? 'var(--green)' : d.ats_score >= 60 ? 'var(--accent)' : 'var(--amber)';
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {d.ats_score}
            </span>
            <div style={{
              width: '100%', maxWidth: 60, borderRadius: '8px 8px 4px 4px',
              background: color,
              height: animated ? height : 0,
              transition: `height 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.2}s`,
              opacity: animated ? 1 : 0,
            }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.filename ? d.filename.substring(0, 12) : `v${i + 1}`}
            </span>
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
   CATEGORY BREAKDOWN BARS
   ═══════════════════════════════════════ */
function CategoryBars({ breakdown, animated }) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)' }}>No breakdown data yet</p>;
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
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load dashboard data. Backend may be starting up — try again in 30 seconds.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const latestScore = history.length > 0 ? history[0].ats_score : 0;
  const firstScore = history.length > 1 ? history[history.length - 1].ats_score : latestScore;
  const improvement = latestScore - firstScore;
  const totalResumes = stats?.total_resumes || 0;
  const avgScore = stats?.average_score || 0;
  const percentile = totalResumes > 0 ? Math.min(Math.round((latestScore / 100) * 100), 99) : 0;
  const latestBreakdown = history.length > 0 ? history[0].score_breakdown : null;

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

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '120px 24px 80px' }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, letterSpacing: -1, marginBottom: 8 }}>
            Your resume analytics
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)' }}>
            Track improvements across all your resume versions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '16px 20px', marginBottom: 24,
            background: 'rgba(255,159,10,0.06)', border: '0.5px solid rgba(255,159,10,0.15)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--amber)',
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Current score', value: `${latestScore}`, sublabel: 'out of 100', color: 'var(--accent)' },
            { label: 'Improvement', value: `${improvement >= 0 ? '+' : ''}${improvement}`, sublabel: 'points gained', color: 'var(--green)' },
            { label: 'Average score', value: `${avgScore}`, sublabel: `across ${totalResumes} resumes`, color: 'var(--purple)' },
            { label: 'Total analyzed', value: `${totalResumes}`, sublabel: 'resumes uploaded', color: 'var(--amber)' },
          ].map((stat, i) => (
            <div key={stat.label} className="animate-fade-up" style={{
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
              animationDelay: `${0.1 + i * 0.1}s`,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, color: stat.color, letterSpacing: -0.5 }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Score Progression */}
          <div className="animate-fade-up stagger-3" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 24 }}>Score progression</h3>
            <BarChart data={[...history].reverse()} animated={visible} />
          </div>

          {/* Category Breakdown */}
          <div className="animate-fade-up stagger-4" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 24 }}>Latest category breakdown</h3>
            <CategoryBars breakdown={latestBreakdown} animated={visible} />
          </div>
        </div>

        {/* Percentile + History */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Percentile */}
          <div className="animate-fade-up stagger-5" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Percentile ranking</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
              {totalResumes > 0
                ? `Your latest score ranks in the ${percentile}th percentile.`
                : 'Upload a resume to see your percentile ranking.'}
            </p>
            <PercentileGauge percentile={percentile} animated={visible} />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: 'var(--accent)',
              }}>
                {percentile}th
              </span>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>percentile</div>
            </div>
          </div>

          {/* Upload History */}
          <div className="animate-fade-up stagger-6" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Upload history</h3>
            {history.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)', padding: '20px 0' }}>No uploads yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {history.map((h, i) => {
                  const scoreColor = h.ats_score >= 80 ? 'var(--green)' : h.ats_score >= 60 ? 'var(--accent)' : 'var(--amber)';
                  const date = h.created_at ? new Date(h.created_at).toLocaleDateString() : '';
                  return (
                    <div key={h.id || i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 0',
                      borderBottom: i < history.length - 1 ? '0.5px solid var(--border-light)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500 }}>{h.filename}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>{date}</div>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                        color: scoreColor,
                        background: `${scoreColor}12`,
                        padding: '4px 12px', borderRadius: 20,
                      }}>
                        {h.ats_score}/100
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}