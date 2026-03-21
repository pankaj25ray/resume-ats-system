'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

/* ═══════════════════════════════════════
   SCORE GAUGE COMPONENT
   ═══════════════════════════════════════ */
function ScoreGauge({ score, animated }) {
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Average' : 'Needs work';

  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
        <circle cx="100" cy="100" r="65" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: -1 }}>
          {animated ? score : 0}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color, fontWeight: 500, marginTop: -4 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   METRIC BAR
   ═══════════════════════════════════════ */
function MetricBar({ label, value, max, color, delay, animated }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', width: 150, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, background: color,
          width: animated ? `${pct}%` : '0%',
          transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, width: 45, textAlign: 'right' }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   LOADING ANIMATION
   ═══════════════════════════════════════ */
function LoadingState() {
  const [step, setStep] = useState(0);
  const steps = ['Extracting text from your resume...', 'Analyzing content with LLaMA AI...', 'Scoring across 7 ATS dimensions...', 'Generating improvements...'];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      textAlign: 'center', padding: '80px 40px',
      background: 'var(--surface-card)',
      border: '0.5px solid var(--border-light)',
      borderRadius: 'var(--radius-xl)',
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 32px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '3px solid rgba(0,113,227,0.12)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 1.2s linear infinite',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
        Analyzing your resume
      </p>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)',
        transition: 'opacity 0.3s',
      }}>
        {steps[step]}
      </p>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6, borderRadius: 3,
            background: i === step ? 'var(--accent)' : 'rgba(0,0,0,0.08)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN ANALYZE PAGE
   ═══════════════════════════════════════ */
export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    const validTypes = ['.pdf', '.docx', '.doc'];
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    setScoreAnimated(false);
    setScoreCount(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://resume-ats-backend-drnu.onrender.com/api/v1/resume/upload-and-analyze', {
        method: 'POST', body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Something went wrong.');
      } else {
        setResult(data);
        setTimeout(() => {
          setScoreAnimated(true);
          let c = 0;
          const target = data.analysis.ats_score;
          const interval = setInterval(() => {
            c = Math.min(c + 1, target);
            setScoreCount(c);
            if (c >= target) clearInterval(interval);
          }, 20);
        }, 300);
      }
    } catch {
      setError('Cannot connect to backend. Make sure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setScoreAnimated(false);
    setScoreCount(0);
  };

  const scoreColor = (s) => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--red)';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Page Header */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
            color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5,
            marginBottom: 12,
          }}>
            Resume analyzer
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 400,
            letterSpacing: -1, marginBottom: 12,
          }}>
            Analyze your resume
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>
            Upload a PDF or DOCX and get a detailed ATS score with AI-powered suggestions.
          </p>
        </div>

        {/* Upload Area */}
        {!result && !loading && (
          <div className="animate-fade-up stagger-2">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: dragOver ? 'var(--accent-light)' : 'var(--surface-card)',
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '64px 40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth="1.2" style={{ transition: 'stroke 0.3s' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                {dragOver ? 'Drop your file here' : 'Drag and drop your resume'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-tertiary)' }}>
                or click to browse — PDF, DOCX, DOC
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected File */}
            {file && (
              <div style={{
                marginTop: 16, padding: '16px 20px',
                background: 'var(--accent-light)', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animation: 'fadeUp 0.3s ease forwards',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>{file.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 16, padding: '14px 20px',
                background: 'rgba(255,59,48,0.06)', border: '0.5px solid rgba(255,59,48,0.15)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--red)',
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!file}
              style={{
                marginTop: 20, width: '100%', padding: '16px 32px',
                fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500,
                background: file ? 'var(--text-primary)' : 'rgba(0,0,0,0.08)',
                color: file ? '#fff' : 'var(--text-tertiary)',
                border: 'none', borderRadius: 'var(--radius-md)',
                cursor: file ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Analyze my resume
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* ═══ RESULTS ═══ */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Score Card */}
            <div className="animate-scale-in" style={{
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)', padding: '40px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 24 }}>
                ATS compatibility score
              </div>
              <ScoreGauge score={result.analysis.ats_score} animated={scoreAnimated} />
              <div style={{
                marginTop: 20, display: 'inline-block',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                color: scoreColor(result.analysis.ats_score),
                background: `${scoreColor(result.analysis.ats_score)}12`,
                padding: '6px 16px', borderRadius: 20,
              }}>
                {result.analysis.ats_score >= 80 ? 'Excellent — ready to submit' : result.analysis.ats_score >= 60 ? 'Average — room for improvement' : 'Needs work — follow suggestions below'}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="animate-fade-up stagger-2" style={{
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)', padding: '32px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500, marginBottom: 24 }}>Score breakdown</h3>
              {Object.entries(result.analysis.score_breakdown || {}).map(([key, value], i) => {
                const maxScores = { keyword_relevance: 25, formatting: 20, section_completeness: 15, quantification: 15, action_verbs: 10, grammar_clarity: 10, length_density: 5 };
                const max = maxScores[key] || 10;
                const pct = (value / max) * 100;
                const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--accent)' : 'var(--amber)';
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return <MetricBar key={key} label={label} value={value} max={max} color={color} delay={i * 0.1} animated={scoreAnimated} />;
              })}
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="animate-fade-up stagger-3" style={{
                background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)', padding: '28px',
              }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Strengths
                </h3>
                {(result.analysis.strengths || []).map((s, i) => (
                  <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '8px 0', borderBottom: i < result.analysis.strengths.length - 1 ? '0.5px solid var(--border-light)' : 'none' }}>
                    {s}
                  </div>
                ))}
              </div>
              <div className="animate-fade-up stagger-4" style={{
                background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)', padding: '28px',
              }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--red)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Weaknesses
                </h3>
                {(result.analysis.weaknesses || []).map((w, i) => (
                  <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, padding: '8px 0', borderBottom: i < result.analysis.weaknesses.length - 1 ? '0.5px solid var(--border-light)' : 'none' }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="animate-fade-up stagger-5" style={{
              background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
              borderRadius: 'var(--radius-xl)', padding: '28px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--accent)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                Suggestions to improve
              </h3>
              {(result.analysis.suggestions || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < result.analysis.suggestions.length - 1 ? '0.5px solid var(--border-light)' : 'none' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}
            </div>

            {/* Improved Summary */}
            {result.analysis.improved_summary && (
              <div className="animate-fade-up stagger-6" style={{
                background: 'var(--surface-card)', border: '0.5px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)', padding: '28px',
              }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: 'var(--purple)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                  AI-improved summary
                </h3>
                <div style={{
                  background: 'rgba(175,82,222,0.04)', border: '0.5px solid rgba(175,82,222,0.12)',
                  borderRadius: 'var(--radius-md)', padding: '20px',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
                  fontStyle: 'italic',
                }}>
                  {result.analysis.improved_summary}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={resetAll} style={{
                flex: 1, padding: '16px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                background: 'transparent', color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}>
                Analyze another resume
              </button>
              <Link href="/dashboard" style={{ flex: 1 }}>
                <button style={{
                  width: '100%', padding: '16px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}>
                  View dashboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}