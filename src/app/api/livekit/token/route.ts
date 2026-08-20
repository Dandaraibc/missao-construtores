import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomName, identity, displayName } = body;

    const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
    const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";
    const livekitUrl = process.env.LIVEKIT_URL || "ws://localhost:7880";

    // Lightweight mock JWT token generation when LiveKit server is optional
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        iss: apiKey,
        sub: identity || "user-local",
        name: displayName || "Visitante",
        video: { room: roomName || "AREA_CENTRAL", roomJoin: true, canPublish: true, canSubscribe: true },
        exp: Math.floor(Date.now() / 1000) + 3600 * 24,
      })
    ).toString("base64url");

    const token = `${header}.${payload}.${Buffer.from(apiSecret).toString("base64url")}`;

    return NextResponse.json({
      success: true,
      token,
      url: livekitUrl,
      roomName: roomName || "AREA_CENTRAL",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ success: false, error: err.message || "Failed to generate LiveKit token" }, { status: 500 });
  }
}
