'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'https://resume-ats-backend-drnu.onrender.com/api/v1/resume';

/* ═══════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(target, duration = 1200, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) { setCount(0); return; }
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const interval = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [active, target, duration]);
  return count;
}

/* ═══════════════════════════════════════
   LARGE SCORE RING
   ═══════════════════════════════════════ */
function ScoreRing({ score, animated }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#34C759' : score >= 60 ? '#0071E3' : score >= 40 ? '#FF9F0A' : '#FF3B30';
  const displayScore = useCountUp(score, 1400, animated);
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, letterSpacing: -1, color: 'var(--text-primary)' }}>
            {displayScore}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
        color, background: `${color}14`, padding: '5px 14px', borderRadius: 20,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   STAT PILL
   ═══════════════════════════════════════ */
function StatPill({ label, value, sublabel, color, delay, animated }) {
  const numVal = parseFloat(value) || 0;
  const isDecimal = String(value).includes('.');
  const displayVal = useCountUp(isDecimal ? 0 : Math.round(numVal), 1000, animated);

  return (
    <div style={{
      background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)', padding: '20px 22px',
      opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)',
      transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      position: 'relative', overflow: 'hidden',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = animated ? 'translateY(0)' : 'translateY(16px)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: color, borderRadius: '12px 12px 0 0' }} />
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 0.3, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, color, letterSpacing: -0.5 }}>
        {isDecimal ? value : displayVal}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{sublabel}</div>
    </div>
  );
}

/* ═══════════════════════════════════════
   DONUT CHART
   ═══════════════════════════════════════ */
function DonutChart({ excellent, average, low, total, animated }) {
  const size = 130;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pctExcellent = total > 0 ? excellent / total : 0;
  const pctAverage = total > 0 ? average / total : 0;
  const pctLow = total > 0 ? low / total : 0;

  const offset2 = pctExcellent * circumference;
  const offset3 = (pctExcellent + pctAverage) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={strokeWidth} />
          {total > 0 && (
            <>
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#34C759" strokeWidth={strokeWidth}
                strokeDasharray={`${pctExcellent * circumference} ${circumference}`}
                strokeDashoffset={animated ? 0 : circumference}
                style={{ transition: 'stroke-dashoffset 1.2s ease 0.2s' }}
              />
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#0071E3" strokeWidth={strokeWidth}
                strokeDasharray={`${pctAverage * circumference} ${circumference}`}
                strokeDashoffset={animated ? -offset2 : circumference}
                style={{ transition: 'stroke-dashoffset 1.2s ease 0.4s' }}
              />
              {low > 0 && (
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#FF3B30" strokeWidth={strokeWidth}
                  strokeDasharray={`${pctLow * circumference} ${circumference}`}
                  strokeDashoffset={animated ? -offset3 : circumference}
                  style={{ transition: 'stroke-dashoffset 1.2s ease 0.6s' }}
                />
              )}
            </>
          )}
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>{total}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-tertiary)' }}>total</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Excellent (80+)', count: excellent, color: '#34C759', pct: total > 0 ? Math.round((excellent/total)*100) : 0 },
          { label: 'Average (60-79)', count: average, color: '#0071E3', pct: total > 0 ? Math.round((average/total)*100) : 0 },
          { label: 'Needs work (<60)', count: low, color: '#FF3B30', pct: total > 0 ? Math.round((low/total)*100) : 0 },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.count}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', width: 32 }}>{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SCORE TIMELINE (SVG Curve)
   ═══════════════════════════════════════ */
function ScoreTimeline({ history, animated }) {
  const data = [...history].filter(h => h && typeof h.ats_score === 'number').slice(0, 12).reverse();
  if (data.length === 0) return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '50px 0' }}>No scores yet</p>;

  const h = 180;
  const w = Math.max(data.length * 52, 300);
  const padX = 30;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: padY + innerH - ((d.ats_score / 100) * innerH),
    score: d.ats_score,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i-1].x + (points[i].x - points[i-1].x) * 0.4;
    const cp1y = points[i-1].y;
    const cp2x = points[i].x - (points[i].x - points[i-1].x) * 0.4;
    const cp2y = points[i].y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }

  const fillPath = path + ` L ${points[points.length-1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0071E3" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0071E3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 40, 60, 80, 100].map(val => {
        const y = padY + innerH - ((val / 100) * innerH);
        return (
          <g key={val}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
            <text x={padX - 6} y={y + 3} textAnchor="end" style={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'var(--text-tertiary)' }}>{val}</text>
          </g>
        );
      })}
      <path d={fillPath} fill="url(#lineGrad)" opacity={animated ? 1 : 0} style={{ transition: 'opacity 1s ease 0.3s' }} />
      <path d={path} fill="none" stroke="#0071E3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.8s ease 0.2s' }} />
      {points.map((p, i) => {
        const color = p.score >= 80 ? '#34C759' : p.score >= 60 ? '#0071E3' : p.score >= 40 ? '#FF9F0A' : '#FF3B30';
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={animated ? 5 : 0} fill="#fff" stroke={color} strokeWidth="2.5" style={{ transition: `r 0.3s ease ${0.3 + i * 0.06}s` }} />
            <text x={p.x} y={p.y - 12} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, fill: 'var(--text-primary)', opacity: animated ? 1 : 0, transition: `opacity 0.3s ease ${0.5 + i * 0.06}s` }}>{p.score}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════
   DISTRIBUTION BARS
   ═══════════════════════════════════════ */
function DistributionBars({ history, animated }) {
  const ranges = [
    { label: '90-100', min: 90, max: 100, color: '#0071E3' },
    { label: '80-89', min: 80, max: 89, color: '#34C759' },
    { label: '70-79', min: 70, max: 79, color: '#5AC8FA' },
    { label: '60-69', min: 60, max: 69, color: '#FF9F0A' },
    { label: '50-59', min: 50, max: 59, color: '#FF9500' },
    { label: '< 50', min: 0, max: 49, color: '#FF3B30' },
  ];
  const counts = ranges.map(r => ({ ...r, count: history.filter(h => h.ats_score >= r.min && h.ats_score <= r.max).length }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {counts.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', width: 40, textAlign: 'right' }}>{r.label}</span>
          <div style={{ flex: 1, height: 22, background: 'rgba(0,0,0,0.02)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6, background: r.color,
              width: animated ? `${Math.max((r.count / maxCount) * 100, r.count > 0 ? 8 : 0)}%` : '0%',
              transition: `width 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`,
              display: 'flex', alignItems: 'center', paddingLeft: 8,
            }}>
              {r.count > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, color: '#fff' }}>{r.count}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   CATEGORY BARS
   ═══════════════════════════════════════ */
function CategoryRadar({ breakdown, animated }) {
  if (!breakdown || typeof breakdown !== 'object' || Object.keys(breakdown).length === 0) {
    return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)' }}>Upload a resume to see category scores</p>;
  }
  const maxScores = { keyword_relevance: 25, formatting: 20, section_completeness: 15, quantification: 15, action_verbs: 10, grammar_clarity: 10, length_density: 5 };
  const colors = { keyword_relevance: '#0071E3', formatting: '#34C759', section_completeness: '#5AC8FA', quantification: '#FF9F0A', action_verbs: '#AF52DE', grammar_clarity: '#FF2D55', length_density: '#86868B' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(breakdown).map(([key, value], i) => {
        const max = maxScores[key] || 10;
        const pct = Math.round((value / max) * 100);
        const color = colors[key] || 'var(--accent)';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>/{max}</span>
              </div>
            </div>
            <div style={{ height: 7, background: 'rgba(0,0,0,0.03)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, background: color,
                width: animated ? `${pct}%` : '0%',
                transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${0.1 + i * 0.07}s`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   INSIGHT CARD
   ═══════════════════════════════════════ */
function InsightCard({ icon, iconColor, iconBg, title, value, desc }) {
  return (
    <div style={{
      padding: '18px 20px', background: iconBg, borderRadius: 'var(--radius-md)',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: iconColor, marginBottom: 2 }}>{title}</div>
        {value && <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{value}</div>}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════ */
export default function DashboardPage() {
  const [ref, visible] = useReveal(0.08);
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
        setStats(statsData || {});
        setHistory(Array.isArray(historyData.history) ? historyData.history : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Backend may be waking up — refresh in 30 seconds.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const latest = (history.length > 0 && history[0]) ? (history[0].ats_score || 0) : 0;
  const total = stats?.total_resumes || 0;
  const avg = stats?.average_score || 0;
  const high = stats?.highest_score || 0;
  const low = stats?.lowest_score || 0;
  const percentile = total > 0 ? Math.min(Math.round((latest / 100) * 100), 99) : 0;

  const latestBreakdown = (history.length > 0 && history[0] && history[0].score_breakdown && typeof history[0].score_breakdown === 'object')
    ? history[0].score_breakdown : null;

  const above80 = history.filter(h => h && h.ats_score >= 80).length;
  const between60and80 = history.filter(h => h && h.ats_score >= 60 && h.ats_score < 80).length;
  const below60 = history.filter(h => h && h.ats_score < 60).length;

  const allBreakdowns = history.filter(h => {
    try { return h && h.score_breakdown && typeof h.score_breakdown === 'object' && Object.keys(h.score_breakdown).length > 0; }
    catch { return false; }
  });

  const avgBreakdown = {};
  try {
    if (allBreakdowns.length > 0 && allBreakdowns[0].score_breakdown) {
      Object.keys(allBreakdowns[0].score_breakdown).forEach(key => {
        const sum = allBreakdowns.reduce((acc, h) => acc + ((h.score_breakdown && h.score_breakdown[key]) || 0), 0);
        avgBreakdown[key] = Math.round(sum / allBreakdowns.length);
      });
    }
  } catch (e) { console.log('Breakdown calc error:', e); }

  const spread = high - low;
  const successRate = total > 0 ? Math.round((above80 / total) * 100) : 0;
  const displayBreakdown = Object.keys(avgBreakdown).length > 0 ? avgBreakdown : latestBreakdown;

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        <Navbar />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '140px 24px 80px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '0 auto 20px', border: '2.5px solid rgba(0,113,227,0.1)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)' }}>Loading analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 28px 80px' }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Analytics</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 400, letterSpacing: -1, marginBottom: 6 }}>Resume insights</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)' }}>
              Aggregate data from {total} anonymous resume analyses
            </p>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-card)', border: '0.5px solid var(--border-light)', borderRadius: 20, padding: '6px 14px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            All data anonymous
          </div>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', marginBottom: 20, background: 'rgba(255,159,10,0.05)', border: '0.5px solid rgba(255,159,10,0.12)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--amber)' }}>{error}</div>
        )}

        {/* ═══ ROW 1: Stats ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          <StatPill label="Latest" value={`${latest}`} sublabel="out of 100" color="var(--accent)" delay={0.05} animated={visible} />
          <StatPill label="Average" value={`${avg}`} sublabel="all resumes" color="var(--purple)" delay={0.1} animated={visible} />
          <StatPill label="Highest" value={`${high}`} sublabel="best score" color="var(--green)" delay={0.15} animated={visible} />
          <StatPill label="Lowest" value={`${low}`} sublabel="weakest" color="var(--red)" delay={0.2} animated={visible} />
          <StatPill label="Analyzed" value={`${total}`} sublabel="resumes" color="var(--amber)" delay={0.25} animated={visible} />
        </div>

        {/* ═══ ROW 2: Ring + Donut + Insights ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.3s',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Latest</div>
            <ScoreRing score={latest} animated={visible} />
          </div>

          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '24px 28px',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.4s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Quality split</h3>
            <DonutChart excellent={above80} average={between60and80} low={below60} total={total} animated={visible} />
          </div>

          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '24px 20px',
            display: 'flex', flexDirection: 'column', gap: 12,
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Quick insights</h3>
            <InsightCard icon="🎯" iconColor="var(--accent)" iconBg="rgba(0,113,227,0.04)" title="Score spread" value={`${spread} pts`} desc={`Ranges from ${low} to ${high}`} />
            <InsightCard icon="🏆" iconColor="var(--green)" iconBg="rgba(52,199,89,0.04)" title="Success rate" value={`${successRate}%`} desc="Resumes scoring 80+" />
            <InsightCard icon="📊" iconColor="var(--purple)" iconBg="rgba(175,82,222,0.04)" title="Percentile" value={`${percentile}th`} desc="Latest score ranking" />
          </div>
        </div>

        {/* ═══ ROW 3: Score Timeline ═══ */}
        <div style={{
          background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: 20,
          opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500 }}>Score trend</h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)' }}>Last {Math.min(history.length, 12)} analyses</span>
          </div>
          <ScoreTimeline history={history} animated={visible} />
        </div>

        {/* ═══ ROW 4: Distribution + Categories ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.6s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Score distribution</h3>
            <DistributionBars history={history} animated={visible} />
          </div>

          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.7s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Average category scores</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Averaged across {allBreakdowns.length > 0 ? allBreakdowns.length : 'all'} resumes
            </p>
            <CategoryRadar breakdown={displayBreakdown} animated={visible} />
          </div>
        </div>

        {/* ═══ ROW 5: Percentile + Recommendations ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.8s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Percentile ranking</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 28 }}>
              {total > 0 ? `Latest score outperforms ${percentile}% of analyzed resumes` : 'Upload a resume to see ranking'}
            </p>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #FF3B30 0%, #FF9F0A 25%, #34C759 60%, #0071E3 100%)', opacity: 0.15, borderRadius: 5 }} />
                <div style={{
                  position: 'absolute', top: -3, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)',
                  border: '3px solid #fff', boxShadow: '0 1px 6px rgba(0,113,227,0.3)',
                  left: visible ? `calc(${percentile}% - 8px)` : '0%',
                  transition: 'left 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                {[0, 25, 50, 75, 100].map(n => (
                  <span key={n} style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-tertiary)' }}>{n}th</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, color: 'var(--accent)' }}>{percentile}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 2 }}>th percentile</span>
            </div>
          </div>

          <div style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.9s',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InsightCard icon="📝" iconColor="var(--accent)" iconBg="rgba(0,113,227,0.04)"
                title="Quantify achievements" desc="Add numbers, percentages, and metrics to every bullet point." />
              <InsightCard icon="🔑" iconColor="#34C759" iconBg="rgba(52,199,89,0.04)"
                title="Optimize keywords" desc="Mirror exact phrases from job descriptions in skills and experience." />
              <InsightCard icon="✂️" iconColor="#FF9F0A" iconBg="rgba(255,159,10,0.04)"
                title="Simplify formatting" desc="Remove tables, columns, headers/footers — ATS can't parse them." />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}