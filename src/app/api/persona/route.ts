import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 获取所有人设
export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        accounts: true,
      },
    });

    const formattedPersonas = personas.map(p => ({
      id: p.id,
      name: p.name,
      tone: p.tone,
      catchphrase: JSON.parse(p.catchphrase || '[]'),
      taboo: JSON.parse(p.taboo || '[]'),
      expertise: JSON.parse(p.expertise || '[]'),
      visualStyle: p.visualStyle,
      accounts: p.accounts.map(a => ({
        platform: a.platform,
        accountName: a.accountName,
        accountId: a.accountId,
        connected: a.connected,
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formattedPersonas });
  } catch (error) {
    console.error('Get personas error:', error);
    return NextResponse.json(
      { success: false, error: '获取人设失败' },
      { status: 500 }
    );
  }
}

// PUT: 更新人设
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, tone, catchphrase, taboo, expertise, visualStyle, accounts } = body;

    // 如果没有 ID，创建一个新的人设
    if (!id) {
      const persona = await prisma.persona.create({
        data: {
          name: name || '新人设',
          tone: tone || '',
          catchphrase: JSON.stringify(catchphrase || []),
          taboo: JSON.stringify(taboo || []),
          expertise: JSON.stringify(expertise || []),
          visualStyle: visualStyle || '',
        },
        include: { accounts: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...persona,
          catchphrase: JSON.parse(persona.catchphrase),
          taboo: JSON.parse(persona.taboo),
          expertise: JSON.parse(persona.expertise),
        },
      });
    }

    // 更新现有的人设
    const persona = await prisma.persona.update({
      where: { id },
      data: {
        name,
        tone,
        catchphrase: JSON.stringify(catchphrase || []),
        taboo: JSON.stringify(taboo || []),
        expertise: JSON.stringify(expertise || []),
        visualStyle,
      },
      include: { accounts: true },
    });

    // 更新账号
    if (accounts && Array.isArray(accounts)) {
      // 删除旧账号
      await prisma.account.deleteMany({
        where: { personaId: id },
      });

      // 创建新账号
      await prisma.account.createMany({
        data: accounts.map((a: { platform: string; accountName: string; accountId?: string; connected?: boolean }) => ({
          personaId: id,
          platform: a.platform,
          accountName: a.accountName,
          accountId: a.accountId || '',
          connected: a.connected || false,
        })),
      });
    }

    // 重新获取更新后的人设
    const updatedPersona = await prisma.persona.findUnique({
      where: { id },
      include: { accounts: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedPersona,
        catchphrase: JSON.parse(updatedPersona?.catchphrase || '[]'),
        taboo: JSON.parse(updatedPersona?.taboo || '[]'),
        expertise: JSON.parse(updatedPersona?.expertise || '[]'),
      },
    });
  } catch (error) {
    console.error('Update persona error:', error);
    return NextResponse.json(
      { success: false, error: '保存人设失败' },
      { status: 500 }
    );
  }
}
