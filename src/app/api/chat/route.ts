import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel") || "area";

    const messages = await prisma.chatMessage.findMany({
      where: { channel },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        user: {
          select: { id: true, displayName: true, shortName: true, role: true }
        }
      }
    });

    const formatted = messages.map(msg => ({
      id: msg.id,
      roomId: msg.channel,
      studentId: msg.userId,
      name: msg.user.shortName || msg.user.displayName,
      text: msg.content,
      createdAt: msg.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { channel, text } = await request.json();
    if (!channel || !text?.trim()) {
      return NextResponse.json({ error: "Canal e texto são obrigatórios" }, { status: 400 });
    }

    const msg = await prisma.chatMessage.create({
      data: {
        channel,
        content: text.trim(),
        userId: user.id
      },
      include: {
        user: { select: { id: true, displayName: true, shortName: true, role: true } }
      }
    });

    const formatted = {
      id: msg.id,
      roomId: msg.channel,
      studentId: msg.userId,
      name: msg.user.shortName || msg.user.displayName,
      text: msg.content,
      createdAt: msg.createdAt.toISOString()
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
