'use client';

import { useState, useEffect } from 'react';
import { Platform, PLATFORM_CONFIG, ContentVersion } from '@/types';
import { cn } from '@/lib/utils';

interface ContentWithVersions {
  id: string;
  status: string;
  versions: (ContentVersion & { id: string })[];
  topic?: { id: string; title: string };
  createdAt: string;
}

const platforms: { key: Platform; label: string; icon: string; desc: string }[] = [
  { key: 'xiaohongshu', label: '小红书', icon: '📖', desc: '3:4竖版图文，emoji+短句+标签' },
  { key: 'wechat', label: '公众号', icon: '💬', desc: '长文结构，2.35:1横版封面' },
  { key: 'douyin', label: '抖音', icon: '🎵', desc: '口播脚本，9:16竖版封面' },
  { key: 'bilibili', label: 'B站', icon: '📺', desc: '深度内容，弹幕互动点' },
];

export default function DistributePage() {
  const [contents, setContents] = useState<ContentWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success) {
        setContents(data.data);
      }
    } catch {
      console.error('加载内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (contentId: string, platform: Platform) => {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const version = content.versions.find(v => v.platform === platform);
    if (!version) return;

    setPublishing(`${contentId}-${platform}`);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content: version,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`发布成功！链接: ${data.data?.url || '无'}`);
        loadContents();
      } else if (data.fallback) {
        alert(`${PLATFORM_CONFIG[platform].nameCN} 平台暂不支持自动发布，已为您准备好导出版本。`);
      } else {
        alert(`发布失败: ${data.error}`);
      }
    } catch {
      alert('发布失败，请稍后重试');
    } finally {
      setPublishing(null);
    }
  };

  const handleExport = (contentId: string, platform: Platform) => {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const version = content.versions.find(v => v.platform === platform);
    if (!version) return;

    const config = PLATFORM_CONFIG[platform];
    const markdown = `# ${version.title}\n\n${version.body}\n\n${version.tags.length > 0 ? `标签: ${version.tags.map(t => '#' + t).join(' ')}` : ''}`;
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.nameCN}_${version.title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 筛选内容
  const filteredContents = contents.filter(c => {
    if (filterPlatform !== 'all' && !c.versions.some(v => v.platform === filterPlatform)) {
      return false;
    }
    if (filterStatus !== 'all' && c.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-50 text-gray-500',
      generating: 'bg-blue-50 text-blue-500',
      review: 'bg-yellow-50 text-yellow-600',
      approved: 'bg-green-50 text-green-600',
      published: 'bg-green-100 text-green-700',
      failed: 'bg-red-50 text-red-500',
    };
    return colors[status] || colors.draft;
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分发枢纽 🚀</h1>
        <p className="text-gray-500 mt-1">一键发布到各平台，或导出标准格式文件</p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-2 gap-4">
        {platforms.map(p => (
          <div key={p.key} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{p.label}</h3>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {p.key === 'wechat' ? (
                <button className="flex-1 px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                  推送草稿箱
                </button>
              ) : (
                <button className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
                  导出文件
                </button>
              )}
              <button className="px-3 py-2 rounded-lg bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 transition-colors">
                设置
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value as Platform | 'all')}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
          >
            <option value="all">全部平台</option>
            {platforms.map(p => (
              <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
          >
            <option value="all">全部状态</option>
            <option value="review">待审核</option>
            <option value="approved">已通过</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        <span className="text-sm text-gray-400">
          共 {filteredContents.length} 条内容
        </span>
      </div>

      {/* Publish Queue */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">内容队列</h2>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="space-y-3">
            {filteredContents.map(content => (
              <div key={content.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {content.topic && (
                      <p className="text-xs text-gray-400 mb-1">选题: {content.topic.title}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(content.status))}>
                        {getStatusLabel(content.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(content.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {content.versions.map(version => (
                    <div key={version.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {platforms.find(p => p.key === version.platform)?.icon}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{version.title}</p>
                          <p className="text-xs text-gray-400">{version.wordCount} 字</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePublish(content.id, version.platform)}
                          disabled={publishing === `${content.id}-${version.platform}`}
                          className={cn(
                            'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                            version.platform === 'wechat'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-orange-500 text-white hover:bg-orange-600',
                            publishing === `${content.id}-${version.platform}` && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {publishing === `${content.id}-${version.platform}` ? '发布中...' : '🚀 发布'}
                        </button>
                        <button
                          onClick={() => handleExport(content.id, version.platform)}
                          className="px-3 py-1.5 rounded bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          📥 导出
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无待发布内容，先去「创作工坊」生成内容吧 ✍️
          </div>
        )}
      </div>
    </div>
  );
}
