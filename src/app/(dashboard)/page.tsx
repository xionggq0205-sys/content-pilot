'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PLATFORM_CONFIG } from '@/types';

const quickActions = [
  { href: '/topics', label: '发现选题', desc: 'AI推荐热门选题', icon: '🎯', color: 'bg-orange-50 text-orange-600' },
  { href: '/create', label: '开始创作', desc: 'AI生成多平台内容', icon: '✍️', color: 'bg-green-50 text-green-600' },
  { href: '/distribute', label: '一键分发', desc: '推送至各平台', icon: '🚀', color: 'bg-blue-50 text-blue-600' },
];

interface Stats {
  topicCount: number;
  contentCount: number;
  publishedCount: number;
}

interface RecentContent {
  id: string;
  versions: { platform: string; title: string }[];
  status: string;
  createdAt: string;
}

interface Persona {
  id: string;
  name: string;
  accounts: { platform: string; connected: boolean }[];
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ topicCount: 0, contentCount: 0, publishedCount: 0 });
  const [recentContents, setRecentContents] = useState<RecentContent[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 并行加载所有数据
      const [topicsRes, contentsRes, personasRes] = await Promise.all([
        fetch('/api/topics'),
        fetch('/api/content'),
        fetch('/api/persona'),
      ]);

      const [topicsData, contentsData, personasData] = await Promise.all([
        topicsRes.json(),
        contentsRes.json(),
        personasRes.json(),
      ]);

      if (topicsData.success) {
        setStats(prev => ({ ...prev, topicCount: topicsData.data.length }));
      }

      if (contentsData.success) {
        const contents = contentsData.data;
        setStats(prev => ({
          ...prev,
          contentCount: contents.length,
          publishedCount: contents.filter((c: RecentContent) => c.status === 'published').length,
        }));
        setRecentContents(contents.slice(0, 5));
      }

      if (personasData.success) {
        setPersonas(personasData.data);
      }
    } catch {
      console.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      generating: '生成中',
      review: '待审核',
      approved: '已通过',
      published: '已发布',
      failed: '失败',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'text-gray-500',
      generating: 'text-blue-500',
      review: 'text-yellow-600',
      approved: 'text-green-600',
      published: 'text-green-700',
      failed: 'text-red-500',
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来 👋</h1>
        <p className="text-gray-500 mt-1">AI原生的一人内容工作室</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-orange-500">{loading ? '-' : stats.topicCount}</div>
          <div className="text-sm text-gray-500 mt-1">选题库</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-green-500">{loading ? '-' : stats.contentCount}</div>
          <div className="text-sm text-gray-500 mt-1">内容</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-2xl font-bold text-blue-500">{loading ? '-' : stats.publishedCount}</div>
          <div className="text-sm text-gray-500 mt-1">已发布</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="p-5 bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-lg mb-3`}>
              {action.icon}
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
              {action.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Platform Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">平台状态</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
            // 查找人设中的账号连接状态
            const connected = personas.some(p => 
              p.accounts.some(a => a.platform === key && a.connected)
            );
            return (
              <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{config.nameCN}</div>
                  <div className={`text-xs ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                    {connected ? '已连接' : '未连接'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Contents */}
      {recentContents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">最近创作</h2>
            <Link href="/distribute" className="text-sm text-orange-500 hover:text-orange-600">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentContents.map(content => (
              <div key={content.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {content.versions.slice(0, 3).map((v, i) => (
                      <span key={i} className="text-sm">{PLATFORM_CONFIG[v.platform as keyof typeof PLATFORM_CONFIG]?.icon}</span>
                    ))}
                    <span className={`text-xs ${getStatusColor(content.status)}`}>
                      {getStatusLabel(content.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">
                    {content.versions[0]?.title || '无标题'}
                  </p>
                </div>
                <Link
                  href="/distribute"
                  className="text-xs text-orange-500 hover:text-orange-600 whitespace-nowrap ml-4"
                >
                  编辑 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border border-orange-100">
        <h2 className="font-semibold text-gray-900 mb-2">快速开始 🚀</h2>
        <div className="text-sm text-gray-600 space-y-1.5">
          <p>1️⃣ 在「设置」中配置你的人设档案和平台账号</p>
          <p>2️⃣ 在「选题中心」发现热门选题</p>
          <p>3️⃣ 在「创作工坊」用AI一键生成4平台内容</p>
          <p>4️⃣ 在「分发枢纽」发布或导出内容</p>
        </div>
      </div>
    </div>
  );
}
