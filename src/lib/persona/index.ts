import { Persona, Platform, PLATFORM_CONFIG } from '@/types';

// 人设档案默认模板
export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'it-man-self-rescue',
    name: 'IT男自救日记',
    accounts: [
      { platform: 'xiaohongshu', accountName: 'IT男自救日记', connected: false },
      { platform: 'wechat', accountName: '跳舞的熊', connected: true },
    ],
    tone: '利落干脆，朋友聊天感，不废话',
    catchphrase: ['走起！', '别卷了，先活下来'],
    taboo: ['不煽情焦虑', '不给医疗建议', '不夸大功效', '不说"治愈"', '不用"秘方"'],
    expertise: ['低精力养生', 'IT职场', '新中式养生', '碎片化养生方案'],
    visualStyle: '黑底+亮橙#FF8C42+薄荷绿#98D8C8+深灰#333+纯白底，扁平风+数据风+仪表盘感',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 平台适配的系统提示词
export function buildPersonaPrompt(persona: Persona, platform: Platform): string {
  const config = PLATFORM_CONFIG[platform];
  const platformGuidelines = getPlatformGuidelines(platform);

  return `你是「${persona.name}」的内容创作AI。请严格按照以下人设和平台规范生成内容。

## 人设档案
- 语气风格：${persona.tone}
- 口头禅：${persona.catchphrase.join('、')}
- 绝对禁忌：${persona.taboo.join('；')}
- 专业领域：${persona.expertise.join('、')}
- 视觉风格：${persona.visualStyle}

## 平台：${config.nameCN}
${platformGuidelines}

## 创作要求
1. 内容必须严格符合人设语气，读起来像本人写的而非AI
2. 自然融入口头禅，但不生硬
3. 绝对不触碰任何禁忌项
4. 适配平台内容格式和长度限制
5. 标题必须吸引点击但不标题党
6. 数据引用必须标注来源
7. 中医引用标注出处，方子加免责声明"以上为中医调理思路，具体用药请咨询专业医师"

## 输出格式
请严格输出以下JSON：
{
  "title": "标题",
  "body": "正文内容",
  "tags": ["标签1", "标签2", "标签3"]
}`;
}

function getPlatformGuidelines(platform: Platform): string {
  const guidelines: Record<Platform, string> = {
    xiaohongshu: `
- 标题≤20字，必须有钩子（数字/反常识/共鸣）
- 正文≤1000字，3-5段短句，每段≤3行
- 大量emoji点缀但不过度（每段1-2个）
- 必须有3-5个#标签
- 封面图3:4竖版
- 内容结构：场景引题→干货3-5点→行动号召
- 口语化聊天感，像朋友在跟你说话`,

    wechat: `
- 标题≤64字，信息量足+悬念感
- 正文1500-2500字，段落分明
- 结构：场景引题→3-5节核心观点→行动总结
- 数据必须标注来源
- 封面图2.35:1横版
- 口语化但稍正式，像在给朋友写长信
- 每节有小标题，便于扫读`,

    douyin: `
- 标题≤55字，前10字必须有钩子
- 口播脚本300字以内
- 结构：前3秒钩子→核心观点(15秒)→行动号召(5秒)
- 短句为主，每句≤15字
- 标注画面提示（如[画面: xxx]）
- 标注字幕节奏点
- 语气更活泼，可以有吐槽和自嘲`,

    bilibili: `
- 标题≤80字，信息量大+有深度感
- 正文≤5000字，可以做深度展开
- 结构：引入→知识讲解→互动点→总结
- 需要标注弹幕互动点（如[弹幕互动: 你们有没有这种感觉？]）
- 知识科普风格，但不枯燥
- 可以适当玩梗但不强行
- 封面图16:9`,
  };

  return guidelines[platform];
}

// 改写提示词
export function buildRewritePrompt(
  sourceContent: string,
  sourcePlatform: Platform,
  targetPlatform: Platform,
  persona: Persona
): string {
  const sourceConfig = PLATFORM_CONFIG[sourcePlatform];
  const targetConfig = PLATFORM_CONFIG[targetPlatform];

  return `你是一个内容改写专家。请将以下${sourceConfig.nameCN}内容改写为${targetConfig.nameCN}版本。

## 人设档案
- 语气风格：${persona.tone}
- 口头禅：${persona.catchphrase.join('、')}
- 禁忌：${persona.taboo.join('；')}
- 专业领域：${persona.expertise.join('、')}

## 改写要求
1. 保留核心观点和信息，但表达方式完全适配${targetConfig.nameCN}的风格
2. 不是简单复制粘贴，改写后字数差异应>30%
3. 严格符合${targetConfig.nameCN}的内容格式和长度规范
4. 自然融入人设语气和口头禅
5. 不触碰禁忌项

${getPlatformGuidelines(targetPlatform)}

## 源内容（${sourceConfig.nameCN}）
${sourceContent}

## 输出格式
请严格输出以下JSON：
{
  "title": "改写后的标题",
  "body": "改写后的正文",
  "tags": ["标签1", "标签2", "标签3"]
}`;
}
