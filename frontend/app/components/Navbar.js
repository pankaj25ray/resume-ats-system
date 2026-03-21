'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '12px 48px' : '18px 48px',
        background: scrolled ? 'rgba(250,250,250,0.82)' : 'rgba(250,250,250,0.6)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '0.5px solid rgba(0,0,0,0.06)' : '0.5px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 18,
          color: 'var(--text-primary)', letterSpacing: '-0.3px',
        }}>
          ResumeAI
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {[
          { label: 'Features', href: '/#features' },
          { label: 'How it works', href: '/#how' },
          { label: 'Dashboard', href: '/dashboard' },
        ].map(link => (
          <Link
            key={link.label}
            href={link.href}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--text-secondary)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/analyze">
          <button style={{
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 20,
            padding: '8px 22px', cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--accent-hover)'; e.target.style.transform = 'scale(1.03)'; }}
          onMouseLeave={e => { e.target.style.background = 'var(--accent)'; e.target.style.transform = 'scale(1)'; }}
          >
            Get started
          </button>
        </Link>
      </div>
    </nav>
  );
}