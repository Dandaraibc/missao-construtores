import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getProjectDeadline } from "@/lib/server/deadlines";
import { requireRole } from "@/lib/auth/session";

const bodySchema = z.object({ deadline: z.string().datetime({ offset: true }), timezone: z.string().min(1).max(80) });

export async function GET() {
  return NextResponse.json(await getProjectDeadline());
}

export async function PUT(request: Request) {
  const user = await requireRole(["UBONGO_ADMIN", "SUPER_ADMIN"]);
  if (!user) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Prazo inválido." }, { status: 400 });
  const existing = await prisma.projectSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  const data = { projectName: "Missão Construtores", startsAt: existing?.startsAt ?? new Date(), projectDeadline: new Date(parsed.data.deadline), timezone: parsed.data.timezone, updatedBy: user.id };
  const saved = existing ? await prisma.projectSetting.update({ where: { id: existing.id }, data }) : await prisma.projectSetting.create({ data });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "project_deadline_updated", entityType: "ProjectSetting", entityId: saved.id, payload: { deadline: saved.projectDeadline.toISOString(), timezone: saved.timezone } } });
  return NextResponse.json(await getProjectDeadline());
}
