'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const API_URL = 'https://resume-ats-backend-drnu.onrender.com/api/v1/resume';

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
    if (!active || !target) { if (!active) setCount(0); return; }
    let start = 0;
    const numTarget = Number(target) || 0;
    const step = Math.max(1, Math.ceil(numTarget / (duration / 16)));
    const interval = setInterval(() => {
      start = Math.min(start + step, numTarget);
      setCount(start);
      if (start >= numTarget) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [active, target, duration]);
  return count;
}

function ScoreRing({ score, animated }) {
  const s = Number(score) || 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (s / 100) * circumference;
  const color = s >= 80 ? '#34C759' : s >= 60 ? '#0071E3' : s >= 40 ? '#FF9F0A' : '#FF3B30';
  const displayScore = useCountUp(s, 1400, animated);
  const label = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
          <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, letterSpacing: -1 }}>{displayScore}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color, background: color + '14', padding: '5px 14px', borderRadius: 20 }}>{label}</div>
    </div>
  );
}

function ScoreDots({ history, animated }) {
  const data = (history || []).filter(h => h && typeof h.ats_score === 'number').slice(0, 10).reverse();
  if (data.length === 0) return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px 0' }}>No scores yet</p>;

  const max = 100;
  const chartH = 160;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: chartH + 30, padding: '0 4px' }}>
      {data.map((d, i) => {
        const h = (d.ats_score / max) * chartH;
        const color = d.ats_score >= 80 ? '#34C759' : d.ats_score >= 60 ? '#0071E3' : d.ats_score >= 40 ? '#FF9F0A' : '#FF3B30';
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 500, color: 'var(--text-primary)', opacity: animated ? 1 : 0, transition: 'opacity 0.4s ease ' + (i * 0.08) + 's' }}>{d.ats_score}</span>
            <div style={{
              width: '100%', maxWidth: 32, borderRadius: '6px 6px 3px 3px', background: color,
              height: animated ? h : 0,
              opacity: animated ? 0.85 : 0,
              transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) ' + (i * 0.06) + 's',
            }} />
          </div>
        );
      })}
    </div>
  );
}

function DistributionBars({ history, animated }) {
  const ranges = [
    { label: '90-100', min: 90, max: 100, color: '#0071E3' },
    { label: '80-89', min: 80, max: 89, color: '#34C759' },
    { label: '70-79', min: 70, max: 79, color: '#5AC8FA' },
    { label: '60-69', min: 60, max: 69, color: '#FF9F0A' },
    { label: '50-59', min: 50, max: 59, color: '#FF9500' },
    { label: '< 50', min: 0, max: 49, color: '#FF3B30' },
  ];
  const counts = ranges.map(r => ({ ...r, count: (history || []).filter(h => h && h.ats_score >= r.min && h.ats_score <= r.max).length }));
  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {counts.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', width: 42, textAlign: 'right' }}>{r.label}</span>
          <div style={{ flex: 1, height: 22, background: 'rgba(0,0,0,0.02)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6, background: r.color,
              width: animated ? Math.max((r.count / maxCount) * 100, r.count > 0 ? 8 : 0) + '%' : '0%',
              transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1) ' + (i * 0.08) + 's',
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

function CategoryBars({ breakdown, animated }) {
  if (!breakdown || typeof breakdown !== 'object') return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)' }}>Upload a resume to see categories</p>;

  let entries = [];
  try { entries = Object.entries(breakdown); } catch (e) { return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)' }}>No data</p>; }
  if (entries.length === 0) return <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)' }}>No breakdown data</p>;

  const maxScores = { keyword_relevance: 25, formatting: 20, section_completeness: 15, quantification: 15, action_verbs: 10, grammar_clarity: 10, length_density: 5 };
  const colors = { keyword_relevance: '#0071E3', formatting: '#34C759', section_completeness: '#5AC8FA', quantification: '#FF9F0A', action_verbs: '#AF52DE', grammar_clarity: '#FF2D55', length_density: '#86868B' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {entries.map(([key, value], i) => {
        const max = maxScores[key] || 10;
        const pct = Math.round(((Number(value) || 0) / max) * 100);
        const color = colors[key] || '#0071E3';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500 }}>{value}/{max}</span>
            </div>
            <div style={{ height: 7, background: 'rgba(0,0,0,0.03)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, background: color,
                width: animated ? pct + '%' : '0%',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1) ' + (0.1 + i * 0.07) + 's',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
          fetch(API_URL + '/stats'),
          fetch(API_URL + '/history')
        ]);
        const sd = await statsRes.json();
        const hd = await historyRes.json();
        setStats(sd || {});
        setHistory(Array.isArray(hd.history) ? hd.history : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Backend may be waking up — refresh in 30 seconds.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  const latest = (history.length > 0 && history[0]) ? (Number(history[0].ats_score) || 0) : 0;
  const total = Number(stats?.total_resumes) || 0;
  const avg = stats?.average_score || 0;
  const high = Number(stats?.highest_score) || 0;
  const low = Number(stats?.lowest_score) || 0;
  const percentile = total > 0 ? Math.min(Math.round((latest / 100) * 100), 99) : 0;
  const spread = high - low;

  const above80 = history.filter(h => h && h.ats_score >= 80).length;
  const bt60and80 = history.filter(h => h && h.ats_score >= 60 && h.ats_score < 80).length;
  const below60 = history.filter(h => h && h.ats_score < 60).length;
  const successRate = total > 0 ? Math.round((above80 / total) * 100) : 0;

  let latestBreakdown = null;
  try {
    if (history.length > 0 && history[0].score_breakdown && typeof history[0].score_breakdown === 'object' && Object.keys(history[0].score_breakdown).length > 0) {
      latestBreakdown = history[0].score_breakdown;
    }
  } catch (e) {}

  let avgBreakdown = null;
  try {
    const validBds = history.filter(h => h && h.score_breakdown && typeof h.score_breakdown === 'object' && Object.keys(h.score_breakdown).length > 0);
    if (validBds.length > 0) {
      const result = {};
      Object.keys(validBds[0].score_breakdown).forEach(key => {
        const sum = validBds.reduce((acc, h) => acc + (Number(h.score_breakdown[key]) || 0), 0);
        result[key] = Math.round(sum / validBds.length);
      });
      if (Object.keys(result).length > 0) avgBreakdown = result;
    }
  } catch (e) {}

  const displayBreakdown = avgBreakdown || latestBreakdown;

  const card = { background: 'var(--surface-card)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '28px' };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', padding: '120px 28px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Analytics</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 400, letterSpacing: -1, marginBottom: 6 }}>Resume insights</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)' }}>Aggregate data from {total} anonymous analyses</p>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-card)', border: '0.5px solid var(--border-light)', borderRadius: 20, padding: '6px 14px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Anonymous data
          </div>
        </div>

        {error && <div style={{ padding: '14px 20px', marginBottom: 20, background: 'rgba(255,159,10,0.05)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--amber)' }}>{error}</div>}

        {/* Row 1: Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Latest', val: latest, sub: 'out of 100', color: 'var(--accent)' },
            { label: 'Average', val: avg, sub: 'all resumes', color: 'var(--purple)' },
            { label: 'Highest', val: high, sub: 'best score', color: 'var(--green)' },
            { label: 'Lowest', val: low, sub: 'weakest', color: 'var(--red)' },
            { label: 'Total', val: total, sub: 'resumes', color: 'var(--amber)' },
          ].map((s, i) => (
            <div key={s.label} style={{
              ...card, padding: '20px 22px', position: 'relative', overflow: 'hidden',
              opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1) ' + (0.05 + i * 0.06) + 's',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: s.color }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, color: s.color, letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Ring + Quality + Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Latest</div>
            <ScoreRing score={latest} animated={visible} />
          </div>

          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>Quality split</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Excellent (80+)', count: above80, color: '#34C759' },
                { label: 'Average (60-79)', count: bt60and80, color: '#0071E3' },
                { label: 'Needs work (<60)', count: below60, color: '#FF3B30' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: item.color }}>{item.count}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>{total > 0 ? Math.round((item.count / total) * 100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 18, gap: 2 }}>
              {above80 > 0 && <div style={{ flex: above80, background: '#34C759', borderRadius: 4 }} />}
              {bt60and80 > 0 && <div style={{ flex: bt60and80, background: '#0071E3', borderRadius: 4 }} />}
              {below60 > 0 && <div style={{ flex: below60, background: '#FF3B30', borderRadius: 4 }} />}
            </div>
          </div>

          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Quick insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { color: 'var(--accent)', bg: 'rgba(0,113,227,0.04)', title: 'Score spread', val: spread + ' pts', desc: 'From ' + low + ' to ' + high },
                { color: 'var(--green)', bg: 'rgba(52,199,89,0.04)', title: 'Success rate', val: successRate + '%', desc: 'Resumes scoring 80+' },
                { color: 'var(--purple)', bg: 'rgba(175,82,222,0.04)', title: 'Percentile', val: percentile + 'th', desc: 'Latest score ranking' },
              ].map(item => (
                <div key={item.title} style={{ padding: '14px 16px', background: item.bg, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: item.color, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, marginBottom: 2 }}>{item.val}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Score Trend */}
        <div style={{ ...card, marginBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500 }}>Score trend</h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)' }}>Last {Math.min(history.length, 10)} analyses</span>
          </div>
          <ScoreDots history={history} animated={visible} />
        </div>

        {/* Row 4: Distribution + Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Score distribution</h3>
            <DistributionBars history={history} animated={visible} />
          </div>
          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.7s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Average category scores</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}>Averaged across all resumes</p>
            <CategoryBars breakdown={displayBreakdown} animated={visible} />
          </div>
        </div>

        {/* Row 5: Percentile + Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Percentile ranking</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 28 }}>
              {total > 0 ? 'Latest score outperforms ' + percentile + '% of resumes' : 'Upload a resume to see ranking'}
            </p>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ height: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 5, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #FF3B30 0%, #FF9F0A 25%, #34C759 60%, #0071E3 100%)', opacity: 0.15, borderRadius: 5 }} />
                <div style={{
                  position: 'absolute', top: -3, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)',
                  border: '3px solid #fff', boxShadow: '0 1px 6px rgba(0,113,227,0.3)',
                  left: visible ? 'calc(' + percentile + '% - 8px)' : '0%',
                  transition: 'left 1.8s cubic-bezier(0.34,1.56,0.64,1)',
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

          <div style={{ ...card, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.9s' }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { color: 'var(--accent)', bg: 'rgba(0,113,227,0.04)', title: 'Quantify achievements', desc: 'Add numbers, percentages, and metrics to every bullet point — the most common gap.' },
                { color: '#34C759', bg: 'rgba(52,199,89,0.04)', title: 'Optimize keywords', desc: 'Mirror exact phrases from job descriptions in skills and experience sections.' },
                { color: '#FF9F0A', bg: 'rgba(255,159,10,0.04)', title: 'Simplify formatting', desc: 'Remove tables, columns, headers/footers — ATS systems cannot parse them.' },
              ].map(item => (
                <div key={item.title} style={{ padding: '16px 18px', background: item.bg, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: item.color, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}