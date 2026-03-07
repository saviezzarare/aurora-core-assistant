import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  mode: "listening" | "speaking" | "idle";
}

const AudioVisualizer = ({ isActive, mode }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array>(new Uint8Array(64));

  useEffect(() => {
    if (mode === "listening" && isActive) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }).catch(() => {});
    }
  }, [mode, isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = 300;
    const h = 60;
    canvas.width = w;
    canvas.height = h;
    let time = 0;

    const draw = () => {
      time += 0.03;
      ctx.clearRect(0, 0, w, h);

      const bars = 32;
      const barW = w / bars - 2;
      const cy = h / 2;

      if (analyserRef.current && mode === "listening") {
        analyserRef.current.getByteFrequencyData(dataRef.current);
      }

      for (let i = 0; i < bars; i++) {
        let amplitude: number;

        if (mode === "listening" && analyserRef.current) {
          amplitude = (dataRef.current[i] || 0) / 255;
        } else if (mode === "speaking") {
          amplitude = 0.3 + 0.5 * Math.sin(time * 4 + i * 0.4) * Math.sin(time * 2.3 + i * 0.2);
          amplitude = Math.abs(amplitude);
        } else {
          amplitude = 0.05 + 0.05 * Math.sin(time + i * 0.3);
        }

        const barH = Math.max(2, amplitude * (h * 0.8));
        const x = i * (barW + 2);

        const alpha = 0.3 + amplitude * 0.7;
        const lightness = 50 + amplitude * 20;

        ctx.fillStyle = `hsla(187, 100%, ${lightness}%, ${alpha})`;
        ctx.fillRect(x, cy - barH / 2, barW, barH);

        // Glow
        ctx.fillStyle = `hsla(187, 100%, 70%, ${alpha * 0.2})`;
        ctx.fillRect(x - 1, cy - barH / 2 - 1, barW + 2, barH + 2);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-[300px] h-[60px] opacity-80"
      style={{ imageRendering: "auto" }}
    />
  );
};

export default AudioVisualizer;
