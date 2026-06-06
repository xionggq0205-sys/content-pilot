'use client';

import { Platform, PLATFORM_CONFIG } from '@/types';
import { DEFAULT_PERSONAS } from '@/lib/persona';

const platforms: { key: Platform; label: string; icon: string; desc: string }[] = [
  { key: 'xiaohongshu', label: '小红书', icon: '📖', desc: '3:4竖版图文，emoji+短句+标签' },
  { key: 'wechat', label: '公众号', icon: '💬', desc: '长文结构，2.35:1横版封面' },
  { key: 'douyin', label: '抖音', icon: '🎵', desc: '口播脚本，9:16竖版封面' },
  { key: 'bilibili', label: 'B站', icon: '📺', desc: '深度内容，弹幕互动点' },
];

export default function DistributePage() {
  const persona = DEFAULT_PERSONAS[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">分发枢纽 🚀</h1>
        <p className="text-gray-500 mt-1">一键发布到各平台，或导出标准格式文件</p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-2 gap-4">
        {platforms.map(p => {
          const account = persona.accounts.find(a => a.platform === p.key);
          return (
            <div key={p.key} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.label}</h3>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${account?.connected ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  {account?.connected ? '✅ 已连接' : '⏳ 待连接'}
                </span>
              </div>

              {account && (
                <div className="text-sm text-gray-500 mb-3">
                  账号：{account.accountName}
                </div>
              )}

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
          );
        })}
      </div>

      {/* Publish Queue */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">发布队列</h2>
        <div className="text-center py-8 text-gray-400 text-sm">
          暂无待发布内容，先去「创作工坊」生成内容吧 ✍️
        </div>
      </div>
    </div>
  );
}
