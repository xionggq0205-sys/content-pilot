'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Platform, Topic } from '@/types';
import { cn } from '@/lib/utils';

interface SavedTopic extends Topic {
  contentCount?: number;
}

export default function TopicsPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [savedTopicIds, setSavedTopicIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'history'>('discover');

  // 加载已保存的选题
  const loadSavedTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      if (data.success) {
        setSavedTopics(data.data);
        setSavedTopicIds(new Set(data.data.map((t: SavedTopic) => t.id)));
      }
    } catch {
      console.error('加载选题失败');
    }
  };

  useEffect(() => {
    loadSavedTopics();
  }, []);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      } else {
        setError(data.error || '生成失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async (topic: Topic) => {
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
      });
      const data = await res.json();
      if (data.success) {
        setSavedTopicIds(prev => new Set([...prev, data.data.id]));
        setSavedTopics(prev => [data.data, ...prev]);
      }
    } catch {
      setError('保存失败');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('确定要删除这个选题吗？')) return;
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSavedTopics(prev => prev.filter(t => t.id !== id));
        setSavedTopicIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      setError('删除失败');
    }
  };

  const handleCreate = (topic: Topic | SavedTopic) => {
    const title = encodeURIComponent(topic.title);
    router.push(`/create?topic=${title}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">选题中心 🎯</h1>
        <p className="text-gray-500 mt-1">输入关键词，AI为你推荐爆款选题</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('discover')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'discover'
              ? 'text-orange-600 border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          )}
        >
          发现选题
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'history'
              ? 'text-orange-600 border-orange-500'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          )}
        >
          历史选题 ({savedTopics.length})
        </button>
      </div>

      {/* Search - Only show in discover tab */}
      {activeTab === 'discover' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="输入赛道关键词，如：低精力养生、价值投资、AI产品经理..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none text-sm transition-colors"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !keyword.trim()}
              className={cn(
                'px-6 py-2.5 rounded-lg text-sm font-medium transition-colors',
                loading || !keyword.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              )}
            >
              {loading ? '生成中...' : '发现选题'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="skeleton h-5 w-2/3 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Topics List - Discover */}
      {activeTab === 'discover' && topics.length > 0 && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">找到 {topics.length} 个选题</span>
          </div>
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">热度</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${topic.heatScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-orange-600">{topic.heatScore}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">竞争</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${topic.competitionScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-blue-600">{topic.competitionScore}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">匹配</span>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${topic.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-green-600">{topic.matchScore}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {!savedTopicIds.has(topic.id) ? (
                  <button
                    onClick={() => handleSaveTopic(topic)}
                    className="px-4 py-2 rounded-lg bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition-colors"
                  >
                    💾 保存选题
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
                    ✅ 已保存
                  </span>
                )}
                <button
                  onClick={() => handleCreate(topic)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  ✍️ 开始创作
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Topics */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {savedTopics.length > 0 ? (
            savedTopics.map(topic => (
              <div
                key={topic.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.source === 'ai' && (
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          AI推荐
                        </span>
                      )}
                      {topic.keyword && (
                        <span className="text-xs text-gray-400">关键词: {topic.keyword}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {topic.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      保存于 {new Date(topic.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleCreate(topic)}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    ✍️ 创作
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500">暂无保存的选题</p>
              <p className="text-sm text-gray-400 mt-1">去「发现选题」中保存一些吧</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state - Discover */}
      {activeTab === 'discover' && topics.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">输入关键词开始发现选题</p>
        </div>
      )}
    </div>
  );
}
