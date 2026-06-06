// ContentPilot - TypeScript 类型定义

// ============ 平台类型 ============
export type Platform = 'xiaohongshu' | 'wechat' | 'douyin' | 'bilibili';

export const PLATFORM_CONFIG: Record<Platform, {
  name: string;
  nameCN: string;
  icon: string;
  contentRatio: string; // 图片比例
  maxTitleLength: number;
  maxContentLength: number;
  features: string[];
}> = {
  xiaohongshu: {
    name: 'xiaohongshu',
    nameCN: '小红书',
    icon: '📖',
    contentRatio: '3:4',
    maxTitleLength: 20,
    maxContentLength: 1000,
    features: ['emoji丰富', '短句分段', '标签', '封面图3:4'],
  },
  wechat: {
    name: 'wechat',
    nameCN: '公众号',
    icon: '💬',
    contentRatio: '2.35:1',
    maxTitleLength: 64,
    maxContentLength: 20000,
    features: ['长文结构', '数据标注', '段落标题', '封面图2.35:1'],
  },
  douyin: {
    name: 'douyin',
    nameCN: '抖音',
    icon: '🎵',
    contentRatio: '9:16',
    maxTitleLength: 55,
    maxContentLength: 300,
    features: ['口播脚本', '字幕节奏', '前3秒钩子', '封面图9:16'],
  },
  bilibili: {
    name: 'bilibili',
    nameCN: 'B站',
    icon: '📺',
    contentRatio: '16:9',
    maxTitleLength: 80,
    maxContentLength: 5000,
    features: ['深度内容', '弹幕互动点', '知识科普', '封面图16:9'],
  },
};

// ============ 人设档案 ============
export interface Persona {
  id: string;
  name: string;
  accounts: Account[];
  tone: string;
  catchphrase: string[];
  taboo: string[];
  expertise: string[];
  visualStyle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  platform: Platform;
  accountName: string;
  accountId?: string;
  connected: boolean;
}

// ============ 内容 ============
export interface Topic {
  id: string;
  keyword: string;
  title: string;
  description: string;
  heatScore: number; // 0-100
  competitionScore: number; // 0-100
  matchScore: number; // 0-100
  source: 'hot' | 'trending' | 'manual' | 'ai';
  tags: string[];
  suggestedPublishTime?: string;
  createdAt: string;
}

export interface Content {
  id: string;
  topicId?: string;
  personaId: string;
  versions: ContentVersion[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = 'draft' | 'generating' | 'review' | 'approved' | 'published' | 'failed';

export interface ContentVersion {
  platform: Platform;
  title: string;
  body: string;
  tags: string[];
  coverImagePrompt?: string;
  coverImageUrl?: string;
  cardImagePrompts?: string[];
  cardImageUrls?: string[];
  wordCount: number;
  isEdited: boolean;
}

// ============ 发布 ============
export interface PublishTask {
  id: string;
  contentId: string;
  platform: Platform;
  status: 'pending' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  result?: string;
  error?: string;
}

// ============ AI 请求/响应 ============
export interface GenerateRequest {
  topic: string;
  persona: Persona;
  platforms: Platform[];
  sourceContent?: string; // 改写时传入源内容
}

export interface GenerateResponse {
  versions: ContentVersion[];
  topic: Topic;
}

export interface RewriteRequest {
  sourceContent: string;
  sourcePlatform: Platform;
  targetPlatforms: Platform[];
  persona: Persona;
}

// ============ API 响应 ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
