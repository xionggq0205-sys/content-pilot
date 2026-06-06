import { NextResponse } from 'next/server';
import { getAdapter } from '@/lib/platforms';
import { ContentVersion } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, content } = body;

    if (!platform || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const adapter = getAdapter(platform);

    // 先校验
    const validation = adapter.validate(content as ContentVersion);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: `内容校验失败: ${validation.errors.join('; ')}` },
        { status: 400 }
      );
    }

    // 尝试发布
    const result = await adapter.publish(content as ContentVersion);

    if (result.success) {
      return NextResponse.json({ success: true, data: { url: result.url } });
    } else {
      // 发布失败，返回导出内容
      const exported = adapter.export(content as ContentVersion);
      return NextResponse.json({
        success: false,
        error: result.error,
        fallback: { exported, platform },
      });
    }
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { success: false, error: '发布失败，请稍后重试' },
      { status: 500 }
    );
  }
}
