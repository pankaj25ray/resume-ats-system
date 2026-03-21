import './globals.css'

export const metadata = {
  title: 'ResumeAI — Free AI Resume ATS Score Checker | Instant Scoring',
  description: 'Free AI-powered ATS resume checker. Upload your resume and get an instant ATS compatibility score, detailed breakdown across 7 categories, and AI-improved suggestions. No sign-up required.',
  keywords: 'ATS score checker, resume checker, ATS resume scanner, resume scoring tool, free ATS checker, AI resume analyzer, resume optimization, ATS compatibility, resume tips, job application tool',
  authors: [{ name: 'ResumeAI' }],
  creator: 'ResumeAI',
  publisher: 'ResumeAI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resume-ats-system.vercel.app',
    siteName: 'ResumeAI',
    title: 'ResumeAI — Free AI Resume ATS Score Checker',
    description: 'Upload your resume and get an instant ATS score with AI-powered suggestions. 100% free, no sign-up required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeAI — Free AI Resume ATS Score Checker',
    description: 'Upload your resume and get an instant ATS score with AI-powered suggestions. 100% free.',
  },
  alternates: {
    canonical: 'https://resume-ats-system.vercel.app',
  },
  verification: {
    google: '',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0071E3" />
      </head>
      <body>{children}</body>
    </html>
  )
}