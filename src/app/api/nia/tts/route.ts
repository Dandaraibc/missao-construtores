import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, modelId } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Texto obrigatório." }, { status: 400 });
    }

    const fishApiKey = process.env.FISH_AUDIO_API_KEY;
    const fishModelId = modelId || process.env.FISH_AUDIO_MODEL_ID || "dece2a4c7f8d476b8da3c3a6707298d4";

    if (fishApiKey) {
      const response = await fetch("https://api.fish.audio/v1/tts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fishApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          reference_id: fishModelId,
          format: "mp3",
          latency: "normal",
        }),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    // Direct link to Fish Audio TTS generator as fallback
    const directUrl = `https://fish.audio/app/text-to-speech/?modelId=${fishModelId}&text=${encodeURIComponent(text.slice(0, 300))}`;
    return NextResponse.json({
      success: true,
      provider: "fish_audio",
      modelId: fishModelId,
      audioUrl: directUrl,
      fallbackBrowserSynthesis: true,
    });
  } catch (error) {
    console.error("Erro na síntese de voz Fish Audio:", error);
    return NextResponse.json({ error: "Falha na geração de áudio." }, { status: 500 });
  }
}
