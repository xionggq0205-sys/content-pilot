import { NextResponse } from 'next/server';
import { generateTopics } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供选题关键词' },
        { status: 400 }
      );
    }

    const topics = await generateTopics(keyword);

    return NextResponse.json({ success: true, data: topics });
  } catch (error) {
    console.error('Generate topics error:', error);
    return NextResponse.json(
      { success: false, error: '选题生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
