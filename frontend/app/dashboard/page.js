'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

/* ═══════════════════════════════════════
   MOCK DATA (replace with API later)
   ═══════════════════════════════════════ */
const mockHistory = [
  { id: 1, filename: 'Pankaj_CV_v1.pdf', score: 52, date: '2026-03-10', strengths: 2, weaknesses: 5 },
  { id: 2, filename: 'Pankaj_CV_v2.pdf', score: 65, date: '2026-03-14', strengths: 3, weaknesses: 3 },
  { id: 3, filename: 'Pankaj_Updated_CV.pdf', score: 72, date: '2026-03-21', strengths: 3, weaknesses: 3 },
];

const percentileData = { score: 72, percentile: 68, totalResumes: 1240 };

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
   MINI BAR CHART
   ═══════════════════════════════════════ */
function BarChart({ data, animated }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, padding: '0 8px' }}>
      {data.map((d, i) => {
        const height = (d.score / 100) * 160;
        const color = d.score >= 80 ? 'var(--green)' : d.score >= 60 ? 'var(--accent)' : 'var(--amber)';
        return (
          <div key={d.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {d.score}
            </span>
            <div style={{
              width: '100%', maxWidth: 60, borderRadius: '8px 8px 4px 4px',
              background: color,
              height: animated ? height : 0,
              transition: `height 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.2}s`,
              opacity: animated ? 1 : 0,
            }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
              v{i + 1}
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
function CategoryBars({ animated }) {
  const categories = [
    { label: 'Keywords', score: 72 },
    { label: 'Formatting', score: 80 },
    { label: 'Completeness', score: 80 },
    { label: 'Quantification', score: 67 },
    { label: 'Action verbs', score: 80 },
    { label: 'Grammar', score: 60 },
    { label: 'Length', score: 40 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {categories.map((c, i) => {
        const color = c.score >= 80 ? 'var(--green)' : c.score >= 60 ? 'var(--accent)' : 'var(--amber)';
        return (
          <div key={c.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{c.label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{c.score}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, background: color,
                width: animated ? `${c.score}%` : '0%',
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
  const latest = mockHistory[mockHistory.length - 1];
  const improvement = latest.score - mockHistory[0].score;

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

        {/* Stats Cards */}
        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Current score', value: `${latest.score}`, sublabel: 'out of 100', color: 'var(--accent)' },
            { label: 'Improvement', value: `+${improvement}`, sublabel: 'points gained', color: 'var(--green)' },
            { label: 'Percentile', value: `${percentileData.percentile}th`, sublabel: `of ${percentileData.totalResumes} resumes`, color: 'var(--purple)' },
            { label: 'Versions analyzed', value: `${mockHistory.length}`, sublabel: 'resumes uploaded', color: 'var(--amber)' },
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
            <BarChart data={mockHistory} animated={visible} />
          </div>

          {/* Category Breakdown */}
          <div className="animate-fade-up stagger-4" style={{
            background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: '28px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, marginBottom: 24 }}>Category breakdown</h3>
            <CategoryBars animated={visible} />
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
              Your resume scores better than {percentileData.percentile}% of all resumes analyzed.
            </p>
            <PercentileGauge percentile={percentileData.percentile} animated={visible} />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, color: 'var(--accent)',
              }}>
                {percentileData.percentile}th
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {mockHistory.map((h, i) => {
                const scoreColor = h.score >= 80 ? 'var(--green)' : h.score >= 60 ? 'var(--accent)' : 'var(--amber)';
                return (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < mockHistory.length - 1 ? '0.5px solid var(--border-light)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500 }}>{h.filename}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>{h.date}</div>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                      color: scoreColor,
                      background: `${scoreColor}12`,
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {h.score}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}