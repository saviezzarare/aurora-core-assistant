import { useEffect, useRef } from "react";

interface Streak {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
  width: number;
}

const VerticalStreaks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const streaksRef = useRef<Streak[]>([]);

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

    const createStreak = (): Streak => {
      // Concentrate on sides (left 20% and right 20%)
      const side = Math.random() > 0.5;
      const margin = canvas.width * 0.25;
      const x = side
        ? canvas.width - Math.random() * margin
        : Math.random() * margin;

      return {
        x,
        y: -Math.random() * canvas.height * 0.5,
        speed: 1 + Math.random() * 3,
        length: 40 + Math.random() * 120,
        alpha: 0.1 + Math.random() * 0.4,
        width: 0.5 + Math.random() * 1.5,
      };
    };

    // Initialize
    for (let i = 0; i < 30; i++) {
      const s = createStreak();
      s.y = Math.random() * canvas.height;
      streaksRef.current.push(s);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const streaks = streaksRef.current;

      // Spawn new
      if (streaks.length < 40 && Math.random() < 0.1) {
        streaks.push(createStreak());
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.y += s.speed;

        if (s.y > canvas.height + s.length) {
          streaks.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, `hsla(150, 100%, 55%, ${s.alpha})`);
        grad.addColorStop(0.5, `hsla(150, 100%, 45%, ${s.alpha * 0.6})`);
        grad.addColorStop(1, `hsla(150, 100%, 40%, 0)`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(150, 100%, 65%, ${s.alpha * 0.8})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default VerticalStreaks;
