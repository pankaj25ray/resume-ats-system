import './globals.css'

export const metadata = {
  title: 'ResumeAI — AI-Powered ATS Scoring System',
  description: 'Upload your resume and get instant ATS scoring, detailed feedback, and an AI-improved version. 100% free, 100% private.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}