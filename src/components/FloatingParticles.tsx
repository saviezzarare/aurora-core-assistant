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
      const dist = 100 + Math.random() * Math.max(canvas.width, canvas.height) * 0.4;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 40;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2 + 0.5,
        alpha: 0,
        life: 0,
        maxLife: 150 + Math.random() * 250,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const maxParticles = activeRef.current ? 50 * intensity : 25;

      if (particles.length < maxParticles && Math.random() < (activeRef.current ? 0.2 : 0.06)) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        if (progress < 0.2) p.alpha = progress / 0.2;
        else if (progress > 0.8) p.alpha = (1 - progress) / 0.2;
        else p.alpha = 1;

        p.alpha *= activeRef.current ? 0.6 : 0.3;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(150, 100%, 55%, ${p.alpha})`;
        ctx.fill();

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(150, 100%, 40%, ${p.alpha * 0.12})`;
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
