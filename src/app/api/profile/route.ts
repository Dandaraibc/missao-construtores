import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const profileSchema = z.object({
  skinTone: z.string().max(30),
  hair: z.string().max(30),
  hairColor: z.string().max(20).default("#201813"),
  face: z.string().max(30).default("default"),
  shirt: z.string().max(30),
  pants: z.string().max(30).default("default"),
  shoes: z.string().max(30).default("default"),
  accessory: z.string().max(30),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de perfil inválidos" }, { status: 400 });
  }

  const { skinTone, hair, hairColor, face, shirt, pants, shoes, accessory } = parsed.data;

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: { skinTone, hair, hairColor, face, shirt, pants, shoes, accessory },
    create: {
      userId: user.id,
      skinTone,
      hair,
      hairColor,
      face,
      shirt,
      pants,
      shoes,
      accessory,
    },
  });

  return NextResponse.json({ profile });
}
