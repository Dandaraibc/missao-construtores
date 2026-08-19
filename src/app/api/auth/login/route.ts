import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { createSession, verifyPassword } from "@/lib/auth/session";

const bodySchema = z.object({ username: z.string().trim().min(1).max(80), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nome e senha são obrigatórios." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username: parsed.data.username.toLowerCase() } });
  if (!user || user.status !== "ACTIVE" || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    return NextResponse.json({ error: "Nome ou senha inválidos." }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.shortName || user.displayName, role: user.role, teamId: user.teamId } });
}
