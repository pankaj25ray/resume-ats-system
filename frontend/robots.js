export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: 'https://resume-ats-system.vercel.app/sitemap.xml',
  }
}