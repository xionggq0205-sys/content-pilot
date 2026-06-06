'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Platform, PLATFORM_CONFIG, ContentVersion } from '@/types';
import { cn } from '@/lib/utils';

const platforms: { key: Platform; label: string; icon: string }[] = [
  { key: 'xiaohongshu', label: '小红书', icon: '📖' },
  { key: 'wechat', label: '公众号', icon: '💬' },
  { key: 'douyin', label: '抖音', icon: '🎵' },
  { key: 'bilibili', label: 'B站', icon: '📺' },
];

interface SavedContent {
  id: string;
  versions: ContentVersion[];
  topic?: { id: string; title: string };
}

function CreatePageContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get('topic');
  
  const [topic, setTopic] = useState(decodeURIComponent(topicParam || ''));
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['xiaohongshu', 'wechat', 'douyin', 'bilibili']);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [activeTab, setActiveTab] = useState<Platform>('xiaohongshu');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'create' | 'rewrite'>('create');
  const [sourceContent, setSourceContent] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<Platform>('xiaohongshu');
  const [savedContent, setSavedContent] = useState<SavedContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState<Platform | null>(null);

  useEffect(() => {
    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
    }
  }, [topicParam]);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim() && mode === 'create') return;
    if (!sourceContent.trim() && mode === 'rewrite') return;

    setLoading(true);
    setError('');
    setSavedContent(null);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || topicParam,
          platforms: selectedPlatforms,
          mode,
          sourceContent: mode === 'rewrite' ? sourceContent : undefined,
          sourcePlatform: mode === 'rewrite' ? sourcePlatform : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVersions(data.data.versions || []);
        if (data.data.versions?.length > 0) {
          setActiveTab(data.data.versions[0].platform);
        }
      } else {
        setError(data.error || '生成失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (versions.length === 0) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: savedContent?.topic?.id,
          versions: versions.map(v => ({
            platform: v.platform,
            title: v.title,
            body: v.body,
            tags: v.tags,
            wordCount: v.wordCount,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedContent(data.data);
      }
    } catch {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEditBody = (newBody: string) => {
    setVersions(prev =>
      prev.map(v =>
        v.platform === activeTab
          ? { ...v, body: newBody, wordCount: newBody.length, isEdited: true }
          : v
      )
    );
  };

  const handlePublish = async (platform: Platform) => {
    const version = versions.find(v => v.platform === platform);
    if (!version) return;

    setPublishing(platform);
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
      } else if (data.fallback) {
        alert(`${platform} 平台暂不支持自动发布，已为您准备好导出版本。`);
      } else {
        alert(`发布失败: ${data.error}`);
      }
    } catch {
      alert('发布失败，请稍后重试');
    } finally {
      setPublishing(null);
    }
  };

  const handleExport = (platform: Platform) => {
    const version = versions.find(v => v.platform === platform);
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

  const activeVersion = versions.find(v => v.platform === activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">创作工坊 ✍️</h1>
        <p className="text-gray-500 mt-1">AI一键生成多平台内容，改写/出图/编辑一站搞定</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('create')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'create' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          从选题创作
        </button>
        <button
          onClick={() => setMode('rewrite')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            mode === 'rewrite' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          一键改写
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {mode === 'create' ? (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">选题</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="输入选题，如：IT男11点后睡不着怎么办"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none text-sm"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">源平台</label>
              <select
                value={sourcePlatform}
                onChange={e => setSourcePlatform(e.target.value as Platform)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm"
              >
                {platforms.map(p => (
                  <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">源内容</label>
              <textarea
                value={sourceContent}
                onChange={e => setSourceContent(e.target.value)}
                placeholder="粘贴要改写的源内容..."
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            目标平台{mode === 'rewrite' ? '（改写目标）' : ''}
          </label>
          <div className="flex gap-2">
            {platforms.map(p => (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  selectedPlatforms.includes(p.key)
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                )}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || selectedPlatforms.length === 0}
          className={cn(
            'w-full py-3 rounded-lg text-sm font-medium transition-colors',
            loading || selectedPlatforms.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          )}
        >
          {loading ? '🤖 AI正在创作...' : `生成 ${selectedPlatforms.length} 个平台版本`}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Results */}
      {versions.length > 0 && (
        <>
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                saving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : savedContent
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              )}
            >
              {saving ? '保存中...' : savedContent ? '✅ 已保存' : '💾 保存内容'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Platform Tabs */}
            <div className="flex border-b border-gray-200">
              {versions.map(v => (
                <button
                  key={v.platform}
                  onClick={() => setActiveTab(v.platform)}
                  className={cn(
                    'px-5 py-3 text-sm font-medium transition-colors border-b-2',
                    activeTab === v.platform
                      ? 'text-orange-600 border-orange-500 bg-orange-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  )}
                >
                  {PLATFORM_CONFIG[v.platform].icon} {PLATFORM_CONFIG[v.platform].nameCN}
                  {v.isEdited && <span className="ml-1 text-xs text-orange-400">已编辑</span>}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeVersion && (
              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">标题</label>
                  <input
                    type="text"
                    value={activeVersion.title}
                    onChange={e => {
                      setVersions(prev =>
                        prev.map(v =>
                          v.platform === activeTab
                            ? { ...v, title: e.target.value, isEdited: true }
                            : v
                        )
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:border-orange-400 outline-none"
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-400">正文</label>
                    <span className="text-xs text-gray-400">{activeVersion.wordCount} 字</span>
                  </div>
                  <textarea
                    value={activeVersion.body}
                    onChange={e => handleEditBody(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm leading-relaxed focus:border-orange-400 outline-none resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">标签</label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeVersion.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handlePublish(activeTab)}
                    disabled={publishing === activeTab}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === 'wechat'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-orange-500 text-white hover:bg-orange-600',
                      publishing === activeTab && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {publishing === activeTab ? '发布中...' : `🚀 发布到${PLATFORM_CONFIG[activeTab].nameCN}`}
                  </button>
                  <button
                    onClick={() => handleExport(activeTab)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    📥 导出
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    🔄 重新生成
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-fade-in"><div className="skeleton h-96 w-full rounded-xl" /></div>}>
      <CreatePageContent />
    </Suspense>
  );
}
