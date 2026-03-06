import { motion } from "framer-motion";

interface AuroraOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
}

const AuroraOrb = ({ isListening = false, isSpeaking = false }: AuroraOrbProps) => {
  const active = isListening || isSpeaking;
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          background: "radial-gradient(circle, hsla(187,100%,50%,0.06) 0%, transparent 70%)",
        }}
        animate={{
          scale: active ? [1, 1.3, 1] : [1, 1.08, 1],
          opacity: active ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: active ? 1.2 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: "radial-gradient(circle, hsla(187,100%,50%,0.12) 0%, hsla(220,100%,10%,0.1) 60%, transparent 80%)",
          border: "1px solid hsla(187,100%,50%,0.1)",
        }}
        animate={{
          scale: active ? [1, 1.15, 1] : [1, 1.05, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: active ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: 140,
          height: 140,
          background: "radial-gradient(circle at 40% 40%, hsla(187,100%,70%,0.4) 0%, hsla(187,100%,50%,0.2) 30%, hsla(240,100%,10%,0.8) 70%, hsla(240,100%,5%,0.9) 100%)",
          boxShadow: `
            0 0 40px hsla(187,100%,50%,0.3),
            0 0 80px hsla(187,100%,50%,0.15),
            inset 0 0 40px hsla(187,100%,50%,0.1)
          `,
          border: "1px solid hsla(187,100%,50%,0.2)",
        }}
        animate={{
          scale: active ? [1, 1.12, 0.95, 1.08, 1] : [1, 1.03, 1],
          boxShadow: active
            ? [
                "0 0 40px hsla(187,100%,50%,0.3), 0 0 80px hsla(187,100%,50%,0.15), inset 0 0 40px hsla(187,100%,50%,0.1)",
                "0 0 80px hsla(187,100%,50%,0.5), 0 0 160px hsla(187,100%,50%,0.3), inset 0 0 60px hsla(187,100%,50%,0.2)",
                "0 0 40px hsla(187,100%,50%,0.3), 0 0 80px hsla(187,100%,50%,0.15), inset 0 0 40px hsla(187,100%,50%,0.1)",
              ]
            : [
                "0 0 40px hsla(187,100%,50%,0.3), 0 0 80px hsla(187,100%,50%,0.15), inset 0 0 40px hsla(187,100%,50%,0.1)",
                "0 0 50px hsla(187,100%,50%,0.35), 0 0 100px hsla(187,100%,50%,0.2), inset 0 0 50px hsla(187,100%,50%,0.15)",
                "0 0 40px hsla(187,100%,50%,0.3), 0 0 80px hsla(187,100%,50%,0.15), inset 0 0 40px hsla(187,100%,50%,0.1)",
              ],
        }}
        transition={{
          duration: active ? 0.6 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 40,
          height: 40,
          background: "radial-gradient(circle, hsla(187,100%,80%,0.6) 0%, hsla(187,100%,50%,0.2) 60%, transparent 100%)",
        }}
        animate={{
          scale: active ? [1, 1.5, 1] : [1, 1.1, 1],
          opacity: active ? [0.8, 1, 0.8] : [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: active ? 0.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default AuroraOrb;
