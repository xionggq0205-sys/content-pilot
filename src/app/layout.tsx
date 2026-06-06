import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContentPilot - 多平台内容运营中心',
  description: 'AI原生的一人内容工作室，让个人创作者用AI完成选题→创作→改写→出图→分发全链路',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
