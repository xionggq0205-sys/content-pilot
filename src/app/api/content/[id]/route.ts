import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 获取单条内容详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        versions: true,
        publishTasks: {
          orderBy: { createdAt: 'desc' },
        },
        topic: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...content,
        versions: content.versions.map(v => ({
          ...v,
          tags: JSON.parse(v.tags || '[]'),
          cardImageUrls: JSON.parse(v.cardImageUrls || '[]'),
        })),
        createdAt: content.createdAt.toISOString(),
        updatedAt: content.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { success: false, error: '获取内容失败' },
      { status: 500 }
    );
  }
}

// PATCH: 更新内容状态
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, versions } = body;

    // 更新内容状态
    if (status) {
      const content = await prisma.content.update({
        where: { id },
        data: { status },
        include: { versions: true },
      });
      return NextResponse.json({
        success: true,
        data: {
          ...content,
          versions: content.versions.map(v => ({
            ...v,
            tags: JSON.parse(v.tags || '[]'),
          })),
        },
      });
    }

    // 更新内容版本
    if (versions) {
      for (const version of versions) {
        await prisma.contentVersion.update({
          where: { id: version.id },
          data: {
            title: version.title,
            body: version.body,
            tags: JSON.stringify(version.tags || []),
            wordCount: version.wordCount,
            isEdited: version.isEdited,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { success: false, error: '更新内容失败' },
      { status: 500 }
    );
  }
}
