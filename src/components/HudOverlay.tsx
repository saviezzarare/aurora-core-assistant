import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HudOverlayProps {
  state: "idle" | "listening" | "thinking" | "speaking";
  reminderCount?: number;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function getGreeting() {
  const t = getTimeOfDay();
  switch (t) {
    case "morning": return "Bom dia";
    case "afternoon": return "Boa tarde";
    case "evening": return "Boa noite";
    case "night": return "Boa madrugada";
  }
}

const HudOverlay = ({ state, reminderCount = 0 }: HudOverlayProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Top-left: Time & Date */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {getGreeting()}, senhor
        </div>
        <div className="font-['Orbitron'] text-3xl font-bold text-foreground tracking-wider text-glow">
          {hours}:{minutes}
          <span className="text-lg text-primary/60 ml-1">{seconds}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 capitalize tracking-wider">
          {dateStr}
        </div>
      </motion.div>

      {/* Top-right: System status */}
      <motion.div
        className="absolute top-6 right-6 z-20 text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 justify-end mb-2">
          <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
            J.A.R.V.I.S.
          </span>
          <div className={`w-2 h-2 rounded-full ${
            state === "listening" ? "bg-green-400 animate-pulse" :
            state === "thinking" ? "bg-yellow-400 animate-pulse" :
            state === "speaking" ? "bg-primary animate-pulse" :
            "bg-muted-foreground"
          }`} />
        </div>
        <div className="space-y-1">
          <StatusLine label="SISTEMA" value="ONLINE" active />
          <StatusLine label="MOTOR IA" value="ATIVO" active />
          <StatusLine label="VOZ" value={state === "listening" ? "ESCUTANDO" : state === "speaking" ? "FALANDO" : "STANDBY"} active={state === "listening" || state === "speaking"} />
          {reminderCount > 0 && (
            <StatusLine label="LEMBRETES" value={`${reminderCount} ATIVO${reminderCount > 1 ? 'S' : ''}`} active />
          )}
        </div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/10 z-10" />
      <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-primary/10 z-10" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-primary/10 z-10" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-primary/10 z-10" />
    </>
  );
};

const StatusLine = ({ label, value, active }: { label: string; value: string; active?: boolean }) => (
  <div className="flex items-center gap-2 justify-end text-[10px] tracking-wider">
    <span className="text-muted-foreground">{label}</span>
    <span className={active ? "text-primary" : "text-muted-foreground/50"}>{value}</span>
  </div>
);

export default HudOverlay;
