import OpenAI from 'openai';
import {
  GenerateRequest,
  GenerateResponse,
  ContentVersion,
  Topic,
  Platform,
  PLATFORM_CONFIG,
  Persona,
} from '@/types';
import { buildPersonaPrompt, buildRewritePrompt } from '@/lib/persona';

// AI 客户端单例
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com',
    });
  }
  return client;
}

// ============ 选题生成 ============
export async function generateTopics(keyword: string): Promise<Topic[]> {
  const ai = getClient();

  const prompt = `你是一个内容选题专家。根据关键词「${keyword}」，生成5个适合自媒体创作的选题。

要求：
1. 选题要具体可执行，不要太空泛
2. 标题要有吸引力，但不是标题党
3. 每个选题包含：标题、简述、热度评估(0-100)、竞争度(0-100)、匹配度(0-100)、标签
4. 标签3-5个

输出JSON数组：
[{
  "title": "选题标题",
  "description": "选题简述，50字以内",
  "heatScore": 80,
  "competitionScore": 60,
  "matchScore": 90,
  "tags": ["标签1", "标签2"]
}]`;

  const response = await ai.chat.completions.create({
    model: process.env.AI_MODEL || 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);
  const topics: Topic[] = (parsed.topics || parsed || []).map((t: Record<string, unknown>, i: number) => ({
    id: `topic_${Date.now()}_${i}`,
    keyword,
    title: t.title as string,
    description: t.description as string,
    heatScore: (t.heatScore as number) || 50,
    competitionScore: (t.competitionScore as number) || 50,
    matchScore: (t.matchScore as number) || 50,
    source: 'ai' as const,
    tags: (t.tags as string[]) || [],
    createdAt: new Date().toISOString(),
  }));

  return topics;
}

// ============ 内容生成 ============
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  const ai = getClient();
  const { topic, persona, platforms, sourceContent } = request;

  const versions: ContentVersion[] = [];

  for (const platform of platforms) {
    const systemPrompt = buildPersonaPrompt(persona, platform);
    const config = PLATFORM_CONFIG[platform];

    let userPrompt: string;
    if (sourceContent) {
      userPrompt = `请根据以下选题改写内容，适配${config.nameCN}平台：

选题：${topic}

源内容：
${sourceContent}`;
    } else {
      userPrompt = `请为以下选题创作${config.nameCN}内容：

选题：${topic}

要求：
- 严格遵守人设和平台规范
- 内容有信息量，不是空话套话
- 标题有钩子但不是标题党
- 正文结构清晰，便于阅读`;
    }

    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    versions.push({
      platform,
      title: parsed.title || topic,
      body: parsed.body || '',
      tags: parsed.tags || [],
      coverImagePrompt: parsed.coverImagePrompt || undefined,
      wordCount: (parsed.body || '').length,
      isEdited: false,
    });
  }

  const topicObj: Topic = {
    id: `topic_${Date.now()}`,
    keyword: topic,
    title: topic,
    description: '',
    heatScore: 0,
    competitionScore: 0,
    matchScore: 0,
    source: 'manual',
    tags: [],
    createdAt: new Date().toISOString(),
  };

  return { versions, topic: topicObj };
}

// ============ 一键改写 ============
export async function rewriteContent(
  sourceContent: string,
  sourcePlatform: Platform,
  targetPlatforms: Platform[],
  persona: Persona
): Promise<ContentVersion[]> {
  const ai = getClient();
  const versions: ContentVersion[] = [];

  for (const targetPlatform of targetPlatforms) {
    if (targetPlatform === sourcePlatform) continue;

    const prompt = buildRewritePrompt(sourceContent, sourcePlatform, targetPlatform, persona);

    const response = await ai.chat.completions.create({
      model: process.env.AI_MODEL || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    versions.push({
      platform: targetPlatform,
      title: parsed.title || '',
      body: parsed.body || '',
      tags: parsed.tags || [],
      wordCount: (parsed.body || '').length,
      isEdited: false,
    });
  }

  return versions;
}
