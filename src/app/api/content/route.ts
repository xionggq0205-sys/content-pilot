import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 查询所有内容
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        versions: true,
        topic: true,
        publishTasks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // 按平台筛选版本
    let formattedContents = contents.map(c => ({
      id: c.id,
      topicId: c.topicId,
      personaId: c.personaId,
      status: c.status,
      versions: c.versions.map(v => ({
        ...v,
        tags: JSON.parse(v.tags || '[]'),
        cardImageUrls: JSON.parse(v.cardImageUrls || '[]'),
      })),
      topic: c.topic ? {
        id: c.topic.id,
        title: c.topic.title,
        keyword: c.topic.keyword,
      } : null,
      latestPublishTask: c.publishTasks[0] || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    // 按平台筛选
    if (platform) {
      formattedContents = formattedContents.filter(c =>
        c.versions.some(v => v.platform === platform)
      );
    }

    return NextResponse.json({ success: true, data: formattedContents });
  } catch (error) {
    console.error('Get contents error:', error);
    return NextResponse.json(
      { success: false, error: '获取内容列表失败' },
      { status: 500 }
    );
  }
}

// POST: 保存生成的内容
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId, personaId, versions } = body;

    // 获取或创建默认人设
    let effectivePersonaId = personaId;
    if (!effectivePersonaId) {
      const persona = await prisma.persona.findFirst();
      if (!persona) {
        // 创建默认人设
        const newPersona = await prisma.persona.create({
          data: {
            id: 'default',
            name: 'IT男自救日记',
            tone: '利落干脆，朋友聊天感，不废话',
            catchphrase: JSON.stringify(['走起！', '别卷了，先活下来']),
            taboo: JSON.stringify(['不煽情焦虑', '不给医疗建议', '不夸大功效']),
            expertise: JSON.stringify(['低精力养生', 'IT职场', '新中式养生']),
            visualStyle: '黑底+亮橙#FF8C42+薄荷绿#98D8C8+深灰#333+纯白底',
          },
        });
        effectivePersonaId = newPersona.id;
      } else {
        effectivePersonaId = persona.id;
      }
    }

    // 创建内容记录
    const content = await prisma.content.create({
      data: {
        topicId: topicId || null,
        personaId: effectivePersonaId,
        status: 'review',
        versions: {
          create: versions.map((v: { platform: string; title: string; body: string; tags?: string[]; wordCount?: number }) => ({
            platform: v.platform,
            title: v.title,
            body: v.body,
            tags: JSON.stringify(v.tags || []),
            wordCount: v.wordCount || v.body?.length || 0,
          })),
        },
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...content,
        versions: content.versions.map(v => ({
          ...v,
          tags: JSON.parse(v.tags || '[]'),
        })),
        createdAt: content.createdAt.toISOString(),
        updatedAt: content.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { success: false, error: '保存内容失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新内容
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, topicId, status, versions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少内容ID' },
        { status: 400 }
      );
    }

    // 更新内容基础信息
    const updateData: Record<string, unknown> = {};
    if (topicId !== undefined) updateData.topicId = topicId;
    if (status !== undefined) updateData.status = status;

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
      include: { versions: true },
    });

    // 更新版本
    if (versions && Array.isArray(versions)) {
      for (const v of versions) {
        if (v.id) {
          await prisma.contentVersion.update({
            where: { id: v.id },
            data: {
              title: v.title,
              body: v.body,
              tags: JSON.stringify(v.tags || []),
              wordCount: v.body?.length || 0,
              isEdited: true,
            },
          });
        }
      }
    }

    // 重新获取更新后的内容
    const updatedContent = await prisma.content.findUnique({
      where: { id },
      include: { versions: true, topic: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedContent,
        versions: updatedContent?.versions.map(v => ({
          ...v,
          tags: JSON.parse(v.tags || '[]'),
          cardImageUrls: JSON.parse(v.cardImageUrls || '[]'),
        })),
        createdAt: updatedContent?.createdAt.toISOString(),
        updatedAt: updatedContent?.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { success: false, error: '更新内容失败' },
      { status: 500 }
    );
  }
}
