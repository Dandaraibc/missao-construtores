import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth/session";

const meetingSchema = z.object({ title: z.string().min(1).max(120), description: z.string().max(2000).optional(), provider: z.enum(["google_meet", "zoom", "jitsi", "other"]).optional(), meetingUrl: z.string().url().optional(), videoEnabled: z.boolean().default(false), roomId: z.string().min(1), startAt: z.string().datetime({ offset: true }), endAt: z.string().datetime({ offset: true }), agenda: z.string().max(2000).optional(), missionId: z.string().optional(), teamId: z.string().optional() });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const meetings = await prisma.meeting.findMany({ where: { endAt: { gte: new Date() } }, orderBy: { startAt: "asc" }, include: { participants: true } });
  return NextResponse.json({ meetings });
}

export async function POST(request: Request) {
  const user = await requireRole(["TEACHER", "UBONGO_ADMIN", "SUPER_ADMIN"]);
  if (!user) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  const parsed = meetingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados da reunião inválidos." }, { status: 400 });
  const meeting = await prisma.meeting.create({ data: { ...parsed.data, createdBy: user.id, startAt: new Date(parsed.data.startAt), endAt: new Date(parsed.data.endAt) } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "meeting_created", entityType: "Meeting", entityId: meeting.id } });
  return NextResponse.json({ meeting }, { status: 201 });
}
