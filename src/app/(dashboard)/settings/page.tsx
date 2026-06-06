'use client';

import { useState, useEffect } from 'react';
import { Persona, Platform } from '@/types';
import { cn } from '@/lib/utils';

const platformIcons: Record<Platform, string> = {
  xiaohongshu: '📖',
  wechat: '💬',
  douyin: '🎵',
  bilibili: '📺',
};

export default function SettingsPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // API 配置
  const [apiKey, setApiKey] = useState('');
  const [wechatAppId, setWechatAppId] = useState('');
  const [wechatAppSecret, setWechatAppSecret] = useState('');

  useEffect(() => {
    loadPersona();
    loadEnvConfig();
  }, []);

  const loadPersona = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/persona');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setPersona(data.data[0]);
      } else {
        // 使用默认人设
        setPersona({
          id: '',
          name: 'IT男自救日记',
          tone: '利落干脆，朋友聊天感，不废话',
          catchphrase: ['走起！', '别卷了，先活下来'],
          taboo: ['不煽情焦虑', '不给医疗建议', '不夸大功效', '不说"治愈"', '不用"秘方"'],
          expertise: ['低精力养生', 'IT职场', '新中式养生', '碎片化养生方案'],
          visualStyle: '黑底+亮橙#FF8C42+薄荷绿#98D8C8+深灰#333+纯白底，扁平风+数据风+仪表盘感',
          accounts: [
            { platform: 'xiaohongshu', accountName: 'IT男自救日记', connected: false },
            { platform: 'wechat', accountName: '跳舞的熊', connected: true },
            { platform: 'douyin', accountName: '', connected: false },
            { platform: 'bilibili', accountName: '', connected: false },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      setError('加载人设失败');
    } finally {
      setLoading(false);
    }
  };

  const loadEnvConfig = () => {
    // 尝试从 localStorage 加载（实际项目中可能从 API 获取）
    setApiKey(localStorage.getItem('apiKey') || '');
    setWechatAppId(localStorage.getItem('wechatAppId') || '');
    setWechatAppSecret(localStorage.getItem('wechatAppSecret') || '');
  };

  const handleSavePersona = async () => {
    if (!persona) return;
    
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/persona', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona),
      });
      const data = await res.json();
      if (data.success) {
        setPersona(data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data.error || '保存失败');
      }
    } catch {
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiConfig = () => {
    // 保存到 localStorage（实际项目中建议通过后端 API 保存到数据库）
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('wechatAppId', wechatAppId);
    localStorage.setItem('wechatAppSecret', wechatAppSecret);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-64 w-full rounded-xl" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">加载失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">设置 ⚙️</h1>
          <p className="text-gray-500 mt-1">管理人设档案和平台账号</p>
        </div>
        <button
          onClick={handleSavePersona}
          disabled={saving}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
            saving
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : saved
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          )}
        >
          {saving ? '保存中...' : saved ? '✅ 已保存' : '保存设置'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

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
            <span className="text-xl">{platformIcons[account.platform]}</span>
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={account.connected}
                onChange={e => {
                  const newAccounts = [...persona.accounts];
                  newAccounts[index] = { ...account, connected: e.target.checked };
                  setPersona({ ...persona, accounts: newAccounts });
                }}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span className="text-sm text-gray-600">已连接</span>
            </label>
          </div>
        ))}
      </div>

      {/* API Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">API 配置</h2>
          <button
            onClick={handleSaveApiConfig}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
          >
            保存配置
          </button>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">AI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">支持 OpenAI / DeepSeek API</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">公众号 AppID</label>
          <input
            type="text"
            value={wechatAppId}
            onChange={e => setWechatAppId(e.target.value)}
            placeholder="wx..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">公众号 AppSecret</label>
          <input
            type="password"
            value={wechatAppSecret}
            onChange={e => setWechatAppSecret(e.target.value)}
            placeholder="..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-orange-400 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
