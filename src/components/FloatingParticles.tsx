import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingParticlesProps {
  isActive?: boolean;
  intensity?: number;
}

const FloatingParticles = ({ isActive = false, intensity = 1 }: FloatingParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const activeRef = useRef(isActive);
  activeRef.current = isActive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 200;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 40;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.3,
        size: Math.random() * 2.5 + 0.5,
        alpha: 0,
        life: 0,
        maxLife: 100 + Math.random() * 200,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const maxParticles = activeRef.current ? 60 * intensity : 20;

      // Spawn
      if (particles.length < maxParticles && Math.random() < (activeRef.current ? 0.3 : 0.08)) {
        particles.push(createParticle());
      }

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in/out
        const progress = p.life / p.maxLife;
        if (progress < 0.2) p.alpha = progress / 0.2;
        else if (progress > 0.8) p.alpha = (1 - progress) / 0.2;
        else p.alpha = 1;

        p.alpha *= activeRef.current ? 0.7 : 0.35;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(187, 100%, 70%, ${p.alpha})`;
        ctx.fill();

        // Glow
        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(187, 100%, 50%, ${p.alpha * 0.15})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};

export default FloatingParticles;
