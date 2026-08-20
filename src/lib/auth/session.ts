import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/server/prisma";
import type { UserRole } from "@prisma/client";
import * as argon2 from "argon2";

export const SESSION_COOKIE = "missao_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyPassword(hash: string, password: string) {
  if (!hash) return false;
  if (hash.startsWith("$argon2")) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
  // Fallback for dev/mock passwords if any
  return hash === password;
}

export async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: hashToken(rawToken), userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function getCurrentUser() {
  const rawToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(rawToken) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") return null;
  await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  return session.user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}

export function isAdminRole(role: UserRole) {
  return role === "UBONGO_ADMIN" || role === "SUPER_ADMIN";
}
