"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onClose: () => void;
}

export default function PingPongModal({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 3;

    let playerY = canvas.height / 2 - 35;
    let aiY = canvas.height / 2 - 35;
    const paddleWidth = 10;
    const paddleHeight = 70;

    let pScore = 0;
    let aScore = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      playerY = Math.max(0, Math.min(canvas.height - paddleHeight, relativeY - paddleHeight / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const relativeY = e.touches[0].clientY - rect.top;
        playerY = Math.max(0, Math.min(canvas.height - paddleHeight, relativeY - paddleHeight / 2));
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX = -ballSpeedX;
      ballSpeedY = (Math.random() - 0.5) * 6;
    };

    const gameLoop = () => {
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      if (ballY <= 5 || ballY >= canvas.height - 5) {
        ballSpeedY = -ballSpeedY;
      }

      const aiCenter = aiY + paddleHeight / 2;
      if (aiCenter < ballY - 10) aiY += 3.2;
      else if (aiCenter > ballY + 10) aiY -= 3.2;
      aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

      if (ballX <= 25 && ballY >= playerY && ballY <= playerY + paddleHeight) {
        ballSpeedX = Math.abs(ballSpeedX) + 0.2;
        ballSpeedY += (ballY - (playerY + paddleHeight / 2)) * 0.1;
      }

      if (ballX >= canvas.width - 25 && ballY >= aiY && ballY <= aiY + paddleHeight) {
        ballSpeedX = -Math.abs(ballSpeedX) - 0.2;
        ballSpeedY += (ballY - (aiY + paddleHeight / 2)) * 0.1;
      }

      if (ballX < 0) {
        aScore++;
        setAiScore(aScore);
        if (aScore >= 5) setGameOver(true);
        else resetBall();
      } else if (ballX > canvas.width) {
        pScore++;
        setPlayerScore(pScore);
        if (pScore >= 5) setGameOver(true);
        else resetBall();
      }

      ctx.fillStyle = "#182333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      ctx.fillStyle = "#8ee85f";
      ctx.fillRect(15, playerY, paddleWidth, paddleHeight);

      ctx.fillStyle = "#6b5fc4";
      ctx.fillRect(canvas.width - 25, aiY, paddleWidth, paddleHeight);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      if (pScore < 5 && aScore < 5) {
        animId = requestAnimationFrame(gameLoop);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-[#8ee85f]/40 bg-[#182333]/90 p-6 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h2 className="font-bold text-lg">Mesa de Ping-Pong - Área de Jogos</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20 transition-all font-semibold"
          >
            Fechar
          </button>
        </div>

        {/* Score Board */}
        <div className="flex justify-between items-center px-8 mb-4 font-mono">
          <div className="text-center">
            <div className="text-xs text-[#8ee85f] uppercase font-bold">Você</div>
            <div className="text-3xl font-extrabold text-[#8ee85f]">{playerScore}</div>
          </div>
          <div className="text-xs text-white/40 font-semibold">PRIMEIRO A 5 PONTOS</div>
          <div className="text-center">
            <div className="text-xs text-[#6b5fc4] uppercase font-bold">Adversário AI</div>
            <div className="text-3xl font-extrabold text-[#6b5fc4]">{aiScore}</div>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex justify-center">
          <canvas
            ref={canvasRef}
            width={520}
            height={320}
            className="w-full rounded-2xl border border-white/20 bg-black cursor-none touch-none shadow-inner"
          />
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 rounded-2xl p-4 text-center">
              <h3 className="text-2xl font-black text-[#8ee85f] mb-2">
                {playerScore >= 5 ? "VITÓRIA!" : "FIM DE JOGO"}
              </h3>
              <p className="text-xs text-white/70 mb-4">
                {playerScore >= 5 ? "Você venceu a partida de Ping-Pong!" : "Boa tentativa! Treine mais no campus."}
              </p>
              <button
                onClick={onClose}
                className="rounded-xl bg-[#8ee85f] px-6 py-2.5 font-extrabold text-[#10160e] hover:bg-[#a6f07b] transition-all"
              >
                Voltar ao Office
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-white/50">
          Mova o mouse ou deslize o dedo para controlar a raquete verde.
        </p>
      </div>
    </div>
  );
}
