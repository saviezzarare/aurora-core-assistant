import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface AuroraOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
}

const ORB_SIZE = 500;

const AuroraOrb = ({ isListening = false, isSpeaking = false }: AuroraOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const active = isListening || isSpeaking;
  const activeRef = useRef(active);
  activeRef.current = active;

  // Parallax: react to mouse position across the viewport
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.6 });

  // Layered offsets — each layer moves at different speed for depth
  const coreX = useTransform(sx, (v) => v * 8);
  const coreY = useTransform(sy, (v) => v * 8);
  const midX = useTransform(sx, (v) => v * 16);
  const midY = useTransform(sy, (v) => v * 16);
  const farX = useTransform(sx, (v) => v * 24);
  const farY = useTransform(sy, (v) => v * 24);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(nx);
      my.set(ny);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = ORB_SIZE;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    let time = 0;

    const draw = () => {
      time += 0.006;
      const isActive = activeRef.current;
      ctx.clearRect(0, 0, size, size);

      const breathe = 1 + Math.sin(time * 1.5) * (isActive ? 0.04 : 0.015);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(breathe, breathe);

      const baseAlpha = isActive ? 0.45 : 0.25;
      const glowPulse = isActive ? 0.15 * Math.sin(time * 3) : 0.05 * Math.sin(time * 1.2);

      const rings = 8;
      const maxR = 180;
      const coreR = 45;

      for (let i = 1; i <= rings; i++) {
        const r = coreR + (maxR - coreR) * (i / rings);
        const wobble = isActive ? Math.sin(time * 2 + i * 0.7) * 3 : Math.sin(time + i * 0.5) * 1;
        const alpha = (baseAlpha + glowPulse) * (0.4 + 0.6 * (1 - i / rings));

        ctx.beginPath();
        ctx.arc(0, 0, r + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(150, 100%, 45%, ${alpha})`;
        ctx.lineWidth = i === 1 ? 1.2 : 0.6;
        ctx.stroke();
      }

      const spokes = 12;
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2 + time * 0.15;
        const wobbleInner = isActive ? Math.sin(time * 3 + i) * 2 : 0;
        const wobbleOuter = isActive ? Math.sin(time * 2 + i * 0.5) * 4 : Math.sin(time + i) * 1.5;
        const innerR = coreR + wobbleInner;
        const outerR = maxR + wobbleOuter;
        const alpha = (baseAlpha + glowPulse) * 0.5;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.strokeStyle = `hsla(150, 100%, 42%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let ring = 2; ring <= rings; ring++) {
        const r = coreR + (maxR - coreR) * (ring / rings);
        for (let i = 0; i < spokes; i++) {
          const a1 = (i / spokes) * Math.PI * 2 + time * 0.15;
          const a2 = ((i + 1) / spokes) * Math.PI * 2 + time * 0.15;
          const midAngle = (a1 + a2) / 2;
          const wobble = isActive ? Math.sin(time * 2.5 + ring + i) * 5 : Math.sin(time * 0.8 + ring + i) * 2;
          const midR = r + wobble;
          const alpha = (baseAlpha + glowPulse) * 0.2;

          ctx.beginPath();
          ctx.moveTo(Math.cos(a1) * r, Math.sin(a1) * r);
          ctx.quadraticCurveTo(
            Math.cos(midAngle) * midR,
            Math.sin(midAngle) * midR,
            Math.cos(a2) * r,
            Math.sin(a2) * r
          );
          ctx.strokeStyle = `hsla(150, 100%, 40%, ${alpha})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      }

      // Glass sphere depth: highlight + inner shadow for tridimensional feel
      const sphereGrad = ctx.createRadialGradient(-coreR * 0.4, -coreR * 0.5, coreR * 0.1, 0, 0, coreR * 1.05);
      sphereGrad.addColorStop(0, `hsla(150, 90%, 55%, ${isActive ? 0.18 : 0.10})`);
      sphereGrad.addColorStop(0.5, `hsla(150, 60%, 10%, 0.6)`);
      sphereGrad.addColorStop(1, `hsla(150, 80%, 4%, 0.95)`);
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Specular highlight (glass reflection)
      const specGrad = ctx.createRadialGradient(-coreR * 0.35, -coreR * 0.45, 1, -coreR * 0.35, -coreR * 0.45, coreR * 0.55);
      specGrad.addColorStop(0, `hsla(150, 100%, 75%, ${isActive ? 0.35 : 0.22})`);
      specGrad.addColorStop(1, `hsla(150, 100%, 60%, 0)`);
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Core ring glow
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(150, 100%, 45%, ${(baseAlpha + glowPulse) * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Horizontal lens flare
      const flareAlpha = (isActive ? 0.35 : 0.15) + glowPulse * 0.5;
      const flareGrad = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
      flareGrad.addColorStop(0, `hsla(150, 100%, 50%, 0)`);
      flareGrad.addColorStop(0.3, `hsla(150, 100%, 50%, ${flareAlpha * 0.3})`);
      flareGrad.addColorStop(0.5, `hsla(150, 100%, 60%, ${flareAlpha})`);
      flareGrad.addColorStop(0.7, `hsla(150, 100%, 50%, ${flareAlpha * 0.3})`);
      flareGrad.addColorStop(1, `hsla(150, 100%, 50%, 0)`);
      ctx.fillStyle = flareGrad;
      ctx.fillRect(-size / 2, -1.5, size, 3);

      // Bright dots at intersections (nodes)
      for (let ring = 1; ring <= rings; ring += 2) {
        const r = coreR + (maxR - coreR) * (ring / rings);
        for (let i = 0; i < spokes; i++) {
          const angle = (i / spokes) * Math.PI * 2 + time * 0.15;
          const nx = Math.cos(angle) * r;
          const ny = Math.sin(angle) * r;
          const pulse = 0.5 + 0.5 * Math.sin(time * 3 + ring + i);
          const dotAlpha = (baseAlpha + glowPulse) * pulse * 0.8;

          ctx.beginPath();
          ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(150, 100%, 60%, ${dotAlpha})`;
          ctx.fill();
        }
      }

      // Outer atmospheric glow (ambient depth)
      const outerGlow = ctx.createRadialGradient(0, 0, maxR * 0.6, 0, 0, maxR * 1.4);
      outerGlow.addColorStop(0, `hsla(150, 100%, 40%, 0)`);
      outerGlow.addColorStop(0.65, `hsla(150, 100%, 35%, ${isActive ? 0.08 : 0.03})`);
      outerGlow.addColorStop(1, `hsla(150, 100%, 30%, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.fillRect(-size / 2, -size / 2, size, size);

      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[500px] md:h-[500px]"
      animate={{
        filter: active
          ? ["drop-shadow(0 0 25px hsla(150,100%,40%,0.3))", "drop-shadow(0 0 55px hsla(150,100%,40%,0.5))", "drop-shadow(0 0 25px hsla(150,100%,40%,0.3))"]
          : "drop-shadow(0 0 18px hsla(150,100%,40%,0.18))",
      }}
      transition={{ duration: active ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Far ambient layer — slowest parallax */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          x: farX,
          y: farY,
          background:
            "radial-gradient(circle at 50% 50%, hsla(150,100%,35%,0.08), transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      {/* Mid glass layer */}
      <motion.div
        aria-hidden
        className="absolute inset-[10%] rounded-full pointer-events-none"
        style={{
          x: midX,
          y: midY,
          background:
            "radial-gradient(circle at 35% 30%, hsla(150,80%,50%,0.10), hsla(150,90%,5%,0.0) 70%)",
        }}
      />
      {/* Core canvas — most responsive parallax */}
      <motion.div className="relative w-full h-full" style={{ x: coreX, y: coreY }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      </motion.div>
    </motion.div>
  );
};

export default AuroraOrb;

