import Link from 'next/link';

const quickActions = [
  { href: '/topics', label: '发现选题', desc: 'AI推荐热门选题', icon: '🎯', color: 'bg-orange-50 text-orange-600' },
  { href: '/create', label: '开始创作', desc: 'AI生成多平台内容', icon: '✍️', color: 'bg-green-50 text-green-600' },
  { href: '/distribute', label: '一键分发', desc: '推送至各平台', icon: '🚀', color: 'bg-blue-50 text-blue-600' },
];

const platforms = [
  { name: '小红书', icon: '📖', status: '未连接', connected: false },
  { name: '公众号', icon: '💬', status: '已连接', connected: true },
  { name: '抖音', icon: '🎵', status: '未连接', connected: false },
  { name: 'B站', icon: '📺', status: '未连接', connected: false },
];

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">欢迎回来 👋</h1>
        <p className="text-gray-500 mt-1">AI原生的一人内容工作室</p>
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
          {platforms.map(p => (
            <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                <div className={`text-xs ${p.connected ? 'text-green-600' : 'text-gray-400'}`}>
                  {p.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
