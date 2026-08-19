import { prisma } from "@/lib/server/prisma";

export const DEFAULT_PROJECT_DEADLINE = "2026-09-04T23:59:00-03:00";
export const DEFAULT_PROJECT_TIMEZONE = "America/Sao_Paulo";

export async function getProjectDeadline() {
  let settings: Awaited<ReturnType<typeof prisma.projectSetting.findFirst>> = null;
  try {
    settings = await prisma.projectSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  } catch {
    // The configured deadline remains available during local UI development before PostgreSQL is provisioned.
  }
  const deadline = settings?.projectDeadline ?? new Date(DEFAULT_PROJECT_DEADLINE);
  const timezone = settings?.timezone ?? DEFAULT_PROJECT_TIMEZONE;
  const startsAt = settings?.startsAt ?? new Date();
  const now = Date.now();
  const total = Math.max(1, deadline.getTime() - startsAt.getTime());
  const elapsed = Math.min(total, Math.max(0, now - startsAt.getTime()));
  const expectedProgress = Math.round((elapsed / total) * 100);
  return {
    deadline: deadline.toISOString(),
    timezone,
    startsAt: startsAt.toISOString(),
    daysRemaining: Math.max(0, Math.ceil((deadline.getTime() - now) / 86400000)),
    isOverdue: deadline.getTime() < now,
    expectedProgress,
  };
}
