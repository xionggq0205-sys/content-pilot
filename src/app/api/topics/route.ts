import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 查询所有选题
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status'); // 用于前端筛选，非数据库字段

    const where: Record<string, unknown> = {};
    if (keyword) {
      where.OR = [
        { keyword: { contains: keyword } },
        { title: { contains: keyword } },
      ];
    }

    const topics = await prisma.topic.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    // 格式化返回数据
    const formattedTopics = topics.map(t => ({
      id: t.id,
      keyword: t.keyword,
      title: t.title,
      description: t.description,
      heatScore: t.heatScore,
      competitionScore: t.competitionScore,
      matchScore: t.matchScore,
      source: t.source,
      tags: JSON.parse(t.tags || '[]'),
      suggestedPublishTime: t.suggestedPublishTime?.toISOString() || null,
      createdAt: t.createdAt.toISOString(),
      contentCount: t._count.contents,
    }));

    return NextResponse.json({ success: true, data: formattedTopics });
  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json(
      { success: false, error: '获取选题失败' },
      { status: 500 }
    );
  }
}

// POST: 保存选题
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, title, description, heatScore, competitionScore, matchScore, source, tags } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: '请提供选题标题' },
        { status: 400 }
      );
    }

    const topic = await prisma.topic.create({
      data: {
        keyword: keyword || '',
        title,
        description: description || '',
        heatScore: heatScore || 0,
        competitionScore: competitionScore || 0,
        matchScore: matchScore || 0,
        source: source || 'ai',
        tags: JSON.stringify(tags || []),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...topic,
        tags: JSON.parse(topic.tags || '[]'),
        createdAt: topic.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { success: false, error: '保存选题失败' },
      { status: 500 }
    );
  }
}
