import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 获取单条选题
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        contents: {
          select: { id: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { success: false, error: '选题不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...topic,
        tags: JSON.parse(topic.tags || '[]'),
        createdAt: topic.createdAt.toISOString(),
        contentCount: topic.contents.length,
      },
    });
  } catch (error) {
    console.error('Get topic error:', error);
    return NextResponse.json(
      { success: false, error: '获取选题失败' },
      { status: 500 }
    );
  }
}

// DELETE: 删除选题
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json(
      { success: false, error: '删除选题失败' },
      { status: 500 }
    );
  }
}
