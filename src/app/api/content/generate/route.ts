import { NextResponse } from 'next/server';
import { generateContent, rewriteContent } from '@/lib/ai';
import { DEFAULT_PERSONAS } from '@/lib/persona';
import { Platform, Persona } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, platforms, personaId, sourceContent, sourcePlatform, mode } = body;

    // 获取人设
    const persona: Persona = DEFAULT_PERSONAS.find(p => p.id === personaId) || DEFAULT_PERSONAS[0];

    if (mode === 'rewrite' && sourceContent && sourcePlatform) {
      // 改写模式
      const targetPlatforms: Platform[] = platforms || ['xiaohongshu', 'douyin', 'bilibili'].filter(
        p => p !== sourcePlatform
      );
      const versions = await rewriteContent(sourceContent, sourcePlatform, targetPlatforms, persona);
      return NextResponse.json({ success: true, data: { versions } });
    }

    // 创作模式
    if (!topic) {
      return NextResponse.json(
        { success: false, error: '请提供选题' },
        { status: 400 }
      );
    }

    const targetPlatforms: Platform[] = platforms || ['xiaohongshu', 'wechat', 'douyin', 'bilibili'];
    const result = await generateContent({
      topic,
      persona,
      platforms: targetPlatforms,
      sourceContent,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json(
      { success: false, error: '内容生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
