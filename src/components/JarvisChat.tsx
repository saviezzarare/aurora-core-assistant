import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AuroraOrb from "./AuroraOrb";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const JARVIS_GREETING = "Good evening, sir. J.A.R.V.I.S. at your service. How may I assist you today?";

const JarvisChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: JARVIS_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    // Simulated response (Cloud not enabled yet)
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm currently operating in **offline mode**, sir. To enable my full intelligence capabilities, please activate **Lovable Cloud** — it will give me access to advanced AI reasoning, memory, and real-time processing.",
      };
      setMessages((prev) => [...prev, response]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h1 className="text-sm font-semibold tracking-[0.3em] uppercase text-primary text-glow">
            J.A.R.V.I.S.
          </h1>
        </div>
        <span className="text-xs text-muted-foreground tracking-wider font-medium">
          SYSTEM ONLINE
        </span>
      </header>

      {/* Aurora + Messages area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden">
        {/* Aurora Orb */}
        <div className="py-8 flex-shrink-0">
          <AuroraOrb isListening={false} isSpeaking={isProcessing} />
        </div>

        {/* Messages */}
        <div className="flex-1 w-full max-w-2xl overflow-y-auto px-4 pb-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground border border-primary/20"
                      : "bg-card text-foreground border border-border/50"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_strong]:text-primary">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Speak to J.A.R.V.I.S..."
              disabled={isProcessing}
              className="w-full bg-input border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="p-3 rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default JarvisChat;
