import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AuroraOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
}

const ORB_SIZE = 425;

const AuroraOrb = ({ isListening = false, isSpeaking = false }: AuroraOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const active = isListening || isSpeaking;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = ORB_SIZE;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    const R = 112;
    const r = 56;
    const rings = 20;
    const segments = 40;

    let time = 0;

    const draw = () => {
      time += 0.008;
      const isActive = activeRef.current;
      const waveAmp = isActive ? 15 : 5;
      const waveSpeed = isActive ? 3 : 1;
      const glowAlpha = isActive ? 0.9 : 0.6;

      ctx.clearRect(0, 0, size, size);

      // Ring lines - deeper blue
      for (let i = 0; i < rings; i++) {
        const u = (i / rings) * Math.PI * 2;
        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const v = (j / segments) * Math.PI * 2;
          const wave = Math.sin(v * 3 + time * waveSpeed + i * 0.5) * waveAmp;
          const rr = r + wave;
          const x3d = (R + rr * Math.cos(v)) * Math.cos(u);
          const y3d = (R + rr * Math.cos(v)) * Math.sin(u);
          const z3d = rr * Math.sin(v);
          const rotX = time * 0.3;
          const y3dr = y3d * Math.cos(rotX) - z3d * Math.sin(rotX);
          const z3dr = y3d * Math.sin(rotX) + z3d * Math.cos(rotX);
          const scale = 375 / (375 + z3dr);
          const px = cx + x3d * scale;
          const py = cy + y3dr * scale;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const alpha = 0.15 + 0.1 * Math.sin(time + i);
        ctx.strokeStyle = `hsla(215, 100%, 60%, ${alpha * glowAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Segment lines
      for (let j = 0; j < segments; j++) {
        const v = (j / segments) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i <= rings; i++) {
          const u = (i / rings) * Math.PI * 2;
          const wave = Math.sin(v * 3 + time * waveSpeed + i * 0.5) * waveAmp;
          const rr = r + wave;
          const x3d = (R + rr * Math.cos(v)) * Math.cos(u);
          const y3d = (R + rr * Math.cos(v)) * Math.sin(u);
          const z3d = rr * Math.sin(v);
          const rotX = time * 0.3;
          const y3dr = y3d * Math.cos(rotX) - z3d * Math.sin(rotX);
          const z3dr = y3d * Math.sin(rotX) + z3d * Math.cos(rotX);
          const scale = 375 / (375 + z3dr);
          const px = cx + x3d * scale;
          const py = cy + y3dr * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const alpha = 0.12 + 0.08 * Math.sin(time * 1.5 + j * 0.3);
        ctx.strokeStyle = `hsla(210, 100%, 65%, ${alpha * glowAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Core glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      grad.addColorStop(0, `hsla(215, 100%, 55%, ${isActive ? 0.1 : 0.04})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[425px] md:h-[425px]"
      animate={{
        filter: active
          ? ["drop-shadow(0 0 20px hsla(215,100%,55%,0.4))", "drop-shadow(0 0 40px hsla(215,100%,55%,0.6))", "drop-shadow(0 0 20px hsla(215,100%,55%,0.4))"]
          : "drop-shadow(0 0 15px hsla(215,100%,55%,0.2))",
      }}
      transition={{ duration: active ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
    </motion.div>
  );
};

export default AuroraOrb;
