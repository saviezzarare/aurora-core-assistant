import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MessageSquare, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AuroraOrb from "./AuroraOrb";
import FloatingParticles from "./FloatingParticles";
import AudioVisualizer from "./AudioVisualizer";
import HudOverlay from "./HudOverlay";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speak } from "@/lib/tts";
import { streamChat } from "@/lib/chatApi";
import { getSessionId } from "@/lib/sessionId";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const JarvisVoice = () => {
  useAdaptiveTheme();

  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [subtitle, setSubtitle] = useState("Toque na aurora para ativar");
  const [activated, setActivated] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [reminderCount, setReminderCount] = useState(0);
  const sessionId = useRef(getSessionId());
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
    loadReminderCount();
    // Check reminders every 30 seconds
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadConversationHistory = async () => {
    try {
      // Get or create conversation for this session
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .eq("session_id", sessionId.current)
        .order("created_at", { ascending: false })
        .limit(1);

      if (convos && convos.length > 0) {
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", convos[0].id)
          .order("created_at", { ascending: true })
          .limit(50);

        if (msgs && msgs.length > 0) {
          setMessages(msgs.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      }
    } catch (e) {
      console.error("Error loading history:", e);
    }
  };

  const saveMessage = async (role: string, content: string) => {
    try {
      // Get or create conversation
      let { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .eq("session_id", sessionId.current)
        .order("created_at", { ascending: false })
        .limit(1);

      let convoId: string;
      if (!convos || convos.length === 0) {
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({ session_id: sessionId.current })
          .select("id")
          .single();
        convoId = newConvo!.id;
      } else {
        convoId = convos[0].id;
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convoId);
      }

      await supabase.from("chat_messages").insert({
        conversation_id: convoId,
        role,
        content,
      });
    } catch (e) {
      console.error("Error saving message:", e);
    }
  };

  const loadReminderCount = async () => {
    const { count } = await supabase
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId.current)
      .eq("completed", false);
    setReminderCount(count || 0);
  };

  const checkReminders = async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("session_id", sessionId.current)
      .eq("completed", false)
      .lte("remind_at", now);

    if (data && data.length > 0) {
      for (const reminder of data) {
        // Mark as completed
        await supabase.from("reminders").update({ completed: true }).eq("id", reminder.id);
        // Announce
        speak(`Senhor, lembrete: ${reminder.title}`, () => {});
        setSubtitle(`🔔 ${reminder.title}`);
      }
      loadReminderCount();
    }
  };

  const handleActivate = () => {
    if (activated) return;
    setActivated(true);
    setState("listening");
    setSubtitle("Sempre ouvindo...");
    startListening();
    speak("Boa noite, senhor. J.A.R.V.I.S. ao seu dispor.", () => {
      setState("listening");
    });
    setState("speaking");
  };

  const handleVoiceResult = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase();

    // Voice commands
    if (lower.includes("abrir chat") || lower.includes("mostrar chat") || lower.includes("open chat")) {
      setChatVisible(true);
      speak("Interface de chat ativada, senhor.", () => setState("listening"));
      setState("speaking");
      return;
    }
    if (lower.includes("fechar chat") || lower.includes("esconder chat") || lower.includes("close chat")) {
      setChatVisible(false);
      speak("Interface de chat desativada, senhor.", () => setState("listening"));
      setState("speaking");
      return;
    }

    setSubtitle(`"${transcript}"`);
    setState("thinking");

    const currentMessages = messagesRef.current;
    const newMessages: Message[] = [...currentMessages, { role: "user", content: transcript }];
    setMessages(newMessages);
    saveMessage("user", transcript);

    let fullResponse = "";
    setCurrentResponse("");

    streamChat({
      messages: newMessages,
      onDelta: (chunk) => {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      },
      onDone: () => {
        setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);
        setCurrentResponse("");
        saveMessage("assistant", fullResponse);
        loadReminderCount();
        setState("speaking");
        speak(fullResponse, () => {
          setState("listening");
          setSubtitle("Sempre ouvindo...");
        });
      },
      onError: (err) => {
        setState("listening");
        setSubtitle(err);
        speak("Me desculpe senhor, encontrei um erro.", () => {
          setState("listening");
          setSubtitle("Sempre ouvindo...");
        });
      },
    });
  }, []);

  const { startListening, stopListening } = useSpeechRecognition(handleVoiceResult);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      <FloatingParticles isActive={state === "listening" || state === "speaking"} />

      {/* HUD Overlay */}
      <HudOverlay state={state} reminderCount={reminderCount} />

      {/* Main orb - clickable to activate */}
      <div className="relative z-10 cursor-pointer" onClick={handleActivate}>
        <AuroraOrb
          isListening={state === "listening"}
          isSpeaking={state === "speaking" || state === "thinking"}
        />
      </div>

      {/* Audio Visualizer */}
      <motion.div
        className="mt-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: activated ? 1 : 0 }}
        transition={{ delay: 0.5 }}
      >
        <AudioVisualizer
          isActive={state === "listening" || state === "speaking"}
          mode={state === "listening" ? "listening" : state === "speaking" ? "speaking" : "idle"}
        />
      </motion.div>

      {/* Status text */}
      <motion.div
        className="mt-4 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2 font-['Orbitron']">
          {!activated && "AGUARDANDO ATIVAÇÃO"}
          {activated && state === "idle" && "STANDBY"}
          {state === "listening" && "ESCUTANDO"}
          {state === "thinking" && "PROCESSANDO"}
          {state === "speaking" && "RESPONDENDO"}
        </p>
        <p className="text-sm text-foreground/60 max-w-xs mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 flex items-center gap-4 z-10">
        {/* Mic indicator */}
        <motion.div animate={{ opacity: state === "listening" ? 1 : 0.3 }}>
          <div className={`p-3 rounded-full border transition-colors ${
            state === "listening" ? "border-primary/50 bg-primary/10" : "border-border/30 bg-transparent"
          }`}>
            <Mic className={`w-5 h-5 ${state === "listening" ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </motion.div>

        {/* Chat toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatVisible(!chatVisible)}
          className={`p-3 rounded-full border transition-colors ${
            chatVisible ? "border-primary/50 bg-primary/10 text-primary" : "border-border/30 text-muted-foreground hover:border-primary/30"
          }`}
        >
          {chatVisible ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Chat overlay */}
      <AnimatePresence>
        {chatVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-24 left-4 right-4 max-w-lg mx-auto max-h-[40vh] overflow-y-auto rounded-xl border border-border/40 bg-card/90 backdrop-blur-xl p-4 z-20"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-['Orbitron']">
                Registro de Conversas
              </p>
              <span className="text-[10px] text-muted-foreground/50">
                {messages.length} mensagens
              </span>
            </div>

            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground/50 text-center py-4">
                Nenhuma conversa ainda. Fale com o J.A.R.V.I.S.!
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {msg.role === "user" ? "Você" : "J.A.R.V.I.S."}
                </span>
                <div className={`text-sm mt-0.5 ${msg.role === "user" ? "text-foreground/70" : "text-foreground"}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_strong]:text-primary [&_table]:text-xs [&_th]:text-primary [&_td]:border-border/30">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {currentResponse && (
              <div className="mb-3 text-left">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">J.A.R.V.I.S.</span>
                <div className="text-sm mt-0.5 text-foreground prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_strong]:text-primary">
                  <ReactMarkdown>{currentResponse}</ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JarvisVoice;
