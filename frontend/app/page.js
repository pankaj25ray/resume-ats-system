'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';

/* ═══════════════════════════════════════
   SCROLL REVEAL HOOK
   ═══════════════════════════════════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ═══════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 25));
    const interval = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [visible, target, duration]);

  return (
    <span ref={ref} style={{ display: 'inline-block' }}>
      {prefix}{target === 0 ? '$0' : count}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════
   FEATURE CARD
   ═══════════════════════════════════════ */
function FeatureCard({ icon, iconBg, title, desc, delay }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{
        background: 'var(--surface-card)',
        border: '0.5px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 28px',
        transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,113,227,0.15)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   STEP CARD
   ═══════════════════════════════════════ */
function StepCard({ num, title, desc, delay }) {
  const [ref, visible] = useReveal(0.15);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      style={{
        display: 'flex', gap: 32, alignItems: 'flex-start', padding: '28px 0',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-20px)',
        transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: hovered ? 'var(--accent)' : 'var(--surface-card)',
        border: `1px solid ${hovered ? 'var(--accent)' : 'var(--border-light)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 18,
        color: hovered ? '#fff' : 'var(--text-primary)',
        position: 'relative', zIndex: 1,
        transition: 'all 0.3s',
      }}>
        {num}
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{title}</h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function Home() {
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScoreAnimated(true);
      let c = 0;
      const interval = setInterval(() => {
        c += 1;
        setScoreCount(c);
        if (c >= 72) clearInterval(interval);
      }, 25);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="1.8"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, iconBg: 'rgba(0,113,227,0.08)', title: 'Instant ATS scoring', desc: 'Get a score from 0-100 with detailed breakdown across 7 categories — keywords, formatting, impact, and more.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.8"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>, iconBg: 'rgba(52,199,89,0.08)', title: 'AI-powered rewriting', desc: 'LLaMA rewrites weak bullet points, adds missing keywords, and generates an improved professional summary.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" strokeWidth="1.8"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>, iconBg: 'rgba(175,82,222,0.08)', title: 'Editable DOCX output', desc: 'Download your corrected resume as an editable Word document, ready to customize and submit.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="1.8"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, iconBg: 'rgba(255,159,10,0.08)', title: 'Score analytics', desc: 'Track your resume improvements over time with visual charts and percentile benchmarking.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="1.8"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, iconBg: 'rgba(255,45,85,0.08)', title: '100% private', desc: 'Everything runs locally on your machine via Ollama. Your resume never leaves your computer.' },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5AC8FA" strokeWidth="1.8"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, iconBg: 'rgba(90,200,250,0.08)', title: 'Zero cost', desc: 'No API keys, no subscriptions. Built entirely on free-tier tools — Ollama, FastAPI, and Next.js.' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{ textAlign: 'center', padding: '140px 48px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Badge */}
        <div className="animate-fade-up stagger-2" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
          color: 'var(--accent)', background: 'var(--accent-light)',
          padding: '6px 14px', borderRadius: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
          Powered by local AI — 100% private
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up stagger-4" style={{
          fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 72,
          letterSpacing: -2, lineHeight: 1.05,
          margin: '28px auto 0', maxWidth: 800,
        }}>
          Your resume,<br />
          <em style={{
            fontStyle: 'italic',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>perfected.</em>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-up stagger-6" style={{
          fontFamily: 'var(--font-body)', fontSize: 19, color: 'var(--text-secondary)',
          lineHeight: 1.6, maxWidth: 520, margin: '24px auto 0',
        }}>
          Upload your resume and get an instant ATS score, detailed breakdown, and an AI-rewritten version — all running locally on your machine.
        </p>

        {/* Buttons */}
        <div className="animate-fade-up stagger-8" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
          <Link href="/analyze">
            <button style={{
              fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500,
              background: 'var(--text-primary)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '16px 32px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.target.style.background = '#000'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--text-primary)'; e.target.style.transform = 'translateY(0)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Upload resume
            </button>
          </Link>
          <a href="#how">
            <button style={{
              fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500,
              background: 'transparent', color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
              padding: '16px 32px', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(0,0,0,0.3)'; e.target.style.background = 'rgba(0,0,0,0.02)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border-medium)'; e.target.style.background = 'transparent'; }}
            >
              See how it works
            </button>
          </a>
        </div>

        {/* Hero Visual — Score Card */}
        <div className="animate-fade-up" style={{ animationDelay: '1s', margin: '60px auto 0', maxWidth: 720, position: 'relative' }}>
          {/* Floating tags */}
          {['Keywords optimized', 'ATS compatible', 'Action verbs added', 'Format corrected'].map((tag, i) => (
            <div key={tag} className="animate-fade-up" style={{
              position: 'absolute',
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              color: 'var(--text-secondary)', whiteSpace: 'nowrap',
              animation: `float 6s ease-in-out infinite ${i * 0.5}s`,
              animationDelay: `${1.5 + i * 0.3}s`,
              zIndex: 2,
              ...[
                { top: 20, left: -30 },
                { top: 80, right: -40 },
                { bottom: 40, left: -20 },
                { bottom: 20, right: -30 },
              ][i],
            }}>
              {tag}
            </div>
          ))}

          {/* Score card */}
          <div style={{
            background: 'var(--surface-card)',
            border: '0.5px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)', padding: 40,
            position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.04) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
              {/* Score Ring */}
              <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
                  <circle cx="80" cy="80" r="65" fill="none" stroke="var(--accent)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray="408"
                    strokeDashoffset={scoreAnimated ? 114 : 408}
                    style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500,
                  letterSpacing: -1,
                }}>
                  {scoreCount}<span style={{ fontSize: 20, color: 'var(--text-tertiary)', fontWeight: 400 }}>/100</span>
                </div>
              </div>

              {/* Score Details */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                  ATS compatibility score
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 22, fontWeight: 500, marginBottom: 20 }}>
                  Pankaj_Resume.pdf
                </div>
                {[
                  { label: 'Keywords', value: 18, max: 25, color: 'var(--accent)', delay: 0.3 },
                  { label: 'Formatting', value: 16, max: 20, color: 'var(--green)', delay: 0.5 },
                  { label: 'Impact', value: 10, max: 15, color: 'var(--amber)', delay: 0.7 },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', width: 120 }}>{m.label}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, background: m.color,
                        width: scoreAnimated ? `${(m.value / m.max) * 100}%` : '0%',
                        transition: `width 1.5s cubic-bezier(0.4,0,0.2,1) ${m.delay}s`,
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, width: 40, textAlign: 'right' }}>
                      {m.value}/{m.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 12 }}>Features</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, textAlign: 'center', letterSpacing: -1, marginBottom: 16 }}>Everything you need to land interviews</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 480, margin: '0 auto 56px' }}>
          A complete toolkit that analyzes, scores, and rewrites your resume to pass any ATS filter.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: '80px 48px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 12 }}>Process</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, textAlign: 'center', letterSpacing: -1, marginBottom: 16 }}>Three steps to a better resume</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 480, margin: '0 auto 40px' }}>
          Upload, analyze, download. It takes less than a minute.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 1, background: 'var(--border-light)' }} />
          <StepCard num="1" title="Upload your resume" desc="Drag and drop your PDF or DOCX file. Our parser extracts every detail — text, sections, formatting — using PyMuPDF and python-docx." delay={0} />
          <StepCard num="2" title="AI analyzes and scores" desc="LLaMA 3.1 evaluates your resume across 7 dimensions — keyword relevance, quantified achievements, action verbs, section completeness, and more." delay={0.15} />
          <StepCard num="3" title="Get your improved resume" desc="Review strengths, weaknesses, and actionable suggestions. Download an AI-improved version as an editable DOCX — ready to submit." delay={0.3} />
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ padding: '60px 48px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'center' }}>
          {[
            { target: 72, suffix: '%', label: 'Average ATS score improvement' },
            { target: 7, suffix: '', label: 'Scoring dimensions analyzed' },
            { target: 0, prefix: '$', suffix: '', label: 'Total cost — forever free' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '32px 20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400, letterSpacing: -1 }}>
                <AnimatedCounter target={s.target} suffix={s.suffix} prefix={s.prefix || ''} />
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', padding: '64px 48px',
          background: 'var(--text-primary)', borderRadius: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60%', right: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,113,227,0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-40%', left: '-10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(52,199,89,0.1)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, color: '#fff', letterSpacing: -1, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            Ready to beat the ATS?
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            Upload your resume now and see exactly how recruiters' software sees you.
          </p>
          <Link href="/analyze">
            <button style={{
              fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500,
              background: '#fff', color: 'var(--text-primary)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '16px 36px', cursor: 'pointer',
              position: 'relative', zIndex: 1,
              transition: 'transform 0.3s',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Upload your resume
            </button>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: '40px 48px', borderTop: '0.5px solid var(--border-light)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)' }}>
          ResumeAI — Built with LLaMA 3.1, FastAPI, Next.js
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'GitHub', 'Contact'].map(link => (
            <a key={link} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}