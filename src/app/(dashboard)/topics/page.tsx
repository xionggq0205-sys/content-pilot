'use client';

import { useState } from 'react';
import { Platform, PLATFORM_CONFIG, Topic } from '@/types';
import { cn } from '@/lib/utils';

const platformFilters: { key: Platform | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'xiaohongshu', label: '小红书' },
  { key: 'wechat', label: '公众号' },
  { key: 'douyin', label: '抖音' },
  { key: 'bilibili', label: 'B站' },
];

export default function TopicsPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">选题中心 🎯</h1>
        <p className="text-gray-500 mt-1">输入关键词，AI为你推荐爆款选题</p>
      </div>

      {/* Search */}
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

      {/* Topics List */}
      {topics.length > 0 && !loading && (
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
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {topics.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500">输入关键词开始发现选题</p>
        </div>
      )}
    </div>
  );
}
