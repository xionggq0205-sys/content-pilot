'use client';

import { useState } from 'react';
import { DEFAULT_PERSONAS } from '@/lib/persona';
import { Persona, Platform } from '@/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONAS[0]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: 保存到数据库
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设置 ⚙️</h1>
          <p className="text-gray-500 mt-1">管理人设档案和平台账号</p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          {saved ? '✅ 已保存' : '保存设置'}
        </button>
      </div>

      {/* Persona */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <h2 className="font-semibold text-gray-900">人设档案</h2>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">账号名称</label>
          <input
            type="text"
            value={persona.name}
            onChange={e => setPersona({ ...persona, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">语气风格</label>
          <input
            type="text"
            value={persona.tone}
            onChange={e => setPersona({ ...persona, tone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">口头禅（每行一个）</label>
          <textarea
            value={persona.catchphrase.join('\n')}
            onChange={e => setPersona({ ...persona, catchphrase: e.target.value.split('\n').filter(Boolean) })}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">禁忌（每行一个）</label>
          <textarea
            value={persona.taboo.join('\n')}
            onChange={e => setPersona({ ...persona, taboo: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">专业领域（每行一个）</label>
          <textarea
            value={persona.expertise.join('\n')}
            onChange={e => setPersona({ ...persona, expertise: e.target.value.split('\n').filter(Boolean) })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">视觉风格</label>
          <input
            type="text"
            value={persona.visualStyle}
            onChange={e => setPersona({ ...persona, visualStyle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">平台账号</h2>
        {persona.accounts.map((account, index) => (
          <div key={account.platform} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
            <span className="text-xl">
              {account.platform === 'xiaohongshu' ? '📖' : account.platform === 'wechat' ? '💬' : account.platform === 'douyin' ? '🎵' : '📺'}
            </span>
            <div className="flex-1">
              <input
                type="text"
                value={account.accountName}
                onChange={e => {
                  const newAccounts = [...persona.accounts];
                  newAccounts[index] = { ...account, accountName: e.target.value };
                  setPersona({ ...persona, accounts: newAccounts });
                }}
                className="w-full px-3 py-1.5 rounded border border-gray-200 text-sm focus:border-orange-400 outline-none"
                placeholder="账号名称"
              />
            </div>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full',
              account.connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
            )}>
              {account.connected ? '已连接' : '未连接'}
            </span>
          </div>
        ))}
      </div>

      {/* API Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">API 配置</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">AI API Key</label>
          <input
            type="password"
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">支持 OpenAI / DeepSeek API</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">公众号 AppID</label>
          <input
            type="text"
            placeholder="wx..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">公众号 AppSecret</label>
          <input
            type="password"
            placeholder="..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
