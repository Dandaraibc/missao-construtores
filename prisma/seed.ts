import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

function hashPasswordSync(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const teams = [
  ["pesquisa", "Pesquisa e Conteúdo", "#059669", "🔬"],
  ["produto", "Produto e Experiência", "#2563eb", "🗺️"],
  ["design", "Design e Identidade Visual", "#7c3aed", "🎨"],
  ["testes", "Testes e Qualidade", "#dc2626", "🐞"],
  ["comunicacao", "Comunicação e Apresentação", "#ea580c", "📢"],
] as const;
const accounts = [
  ["niltes", "Niltes", "TEACHER", "Nilt26", null], ["diego", "Diego", "TEACHER", "Diego47", null],
  ["prietto", "Prietto", "UBONGO_ADMIN", "Prie52", null], ["matheus", "Matheus", "UBONGO_ADMIN", "Math67", null], ["dandara", "Dandara", "UBONGO_ADMIN", "Danda64", null],
  ["adrianno", "Adrianno", "STUDENT", "Adri27", "pesquisa"], ["angelina", "Angelina", "STUDENT", "Ange43", "pesquisa"], ["arthur", "Arthur", "STUDENT", "Artu58", "produto"], ["beatriz", "Beatriz", "STUDENT", "Beat31", "produto"], ["bianca", "Bianca", "STUDENT", "Bian72", "design"], ["bruno", "Bruno", "STUDENT", "Brun46", "design"], ["enzo", "Enzo", "STUDENT", "Enzo29", "testes"], ["felippe", "Felippe", "STUDENT", "Feli63", "testes"], ["marcella", "Marcella", "STUDENT", "Marc37", "comunicacao"], ["maria", "Maria", "STUDENT", "Mari54", "comunicacao"], ["maryana", "Maryana", "STUDENT", "Mary28", "pesquisa"], ["maryna", "Maryna", "STUDENT", "Myna61", "produto"], ["pietro", "Pietro", "STUDENT", "Piet35", "design"], ["sarah", "Sarah", "STUDENT", "Sara74", "testes"], ["thales", "Thales", "STUDENT", "Thal42", "comunicacao"], ["vitoria", "Vitoria", "STUDENT", "Vito57", "pesquisa"], ["luiza", "Luiza", "STUDENT", "Luiz36", "produto"],
] as const;

async function main() {
  for (const [slug, name, color, icon] of teams) await prisma.team.upsert({ where: { slug }, update: { name, color, icon }, create: { slug, name, color, icon } });
  const passwordHash = hashPasswordSync(process.env.SEED_ADMIN_PASSWORD || "change-me-now");
  await prisma.user.upsert({ where: { username: "admin" }, update: { passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" }, create: { username: "admin", displayName: "Administrador Ubongo", shortName: "Admin", passwordHash, role: "SUPER_ADMIN" } });
  for (const [username, displayName, role, password, teamSlug] of accounts) {
    const passwordHash = hashPasswordSync(password);
    const user = await prisma.user.upsert({ where: { username }, update: { displayName, shortName: displayName, passwordHash, role: "STUDENT", status: "ACTIVE" }, create: { username, displayName, shortName: displayName, passwordHash, role: "STUDENT", status: "ACTIVE" } });
    if (teamSlug) { await prisma.team.update({ where: { slug: teamSlug }, data: { users: { connect: { id: user.id } } } }); }
  }
  await prisma.projectSetting.upsert({ where: { id: "project-missao-construtores" }, update: {}, create: { id: "project-missao-construtores", projectName: "Missão Construtores", startsAt: new Date(), projectDeadline: new Date("2026-09-04T23:59:00-03:00"), timezone: "America/Sao_Paulo" } });
}

main().finally(() => prisma.$disconnect());
