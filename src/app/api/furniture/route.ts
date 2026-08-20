import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    const furnitures = await prisma.furniture.findMany({
      where: roomId ? { roomId } : undefined,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: furnitures });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch furniture entities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, roomId, furnitureType, x, y, rotation, state, movable, interactionType, ownerTeamId, permissions } = body;

    if (!roomId || !furnitureType || x === undefined || y === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields: roomId, furnitureType, x, y" }, { status: 400 });
    }

    const furniture = await prisma.furniture.upsert({
      where: { id: id || "new-furniture-id" },
      update: {
        x: Math.round(x / 32) * 32, // Grid snap to 32px grid
        y: Math.round(y / 32) * 32,
        rotation: rotation || 0,
        state: state || {},
        movable: movable ?? true,
        interactionType: interactionType || null,
        ownerTeamId: ownerTeamId || null,
        permissions: permissions || {},
      },
      create: {
        id: id || undefined,
        roomId,
        furnitureType,
        x: Math.round(x / 32) * 32,
        y: Math.round(y / 32) * 32,
        rotation: rotation || 0,
        state: state || {},
        movable: movable ?? true,
        interactionType: interactionType || null,
        ownerTeamId: ownerTeamId || null,
        permissions: permissions || {},
      },
    });

    return NextResponse.json({ success: true, data: furniture });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Failed to save furniture entity" }, { status: 500 });
  }
}
