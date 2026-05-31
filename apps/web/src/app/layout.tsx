import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CopyCraft - AI Copywriting Tool',
  description: 'Turn your ideas into platform-optimized copy with AI. Create engaging content for WeChat, Xiaohongshu, Weibo, and more.',
  openGraph: {
    title: 'CopyCraft - AI Copywriting Tool',
    description: 'Turn your ideas into platform-optimized copy with AI.',
    type: 'website',
    locale: 'zh_CN',
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}