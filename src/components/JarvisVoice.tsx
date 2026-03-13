import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MessageSquare, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AuroraOrb from "./AuroraOrb";
import FloatingParticles from "./FloatingParticles";
import VerticalStreaks from "./VerticalStreaks";
import AudioVisualizer from "./AudioVisualizer";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speak } from "@/lib/tts";
import { streamChat } from "@/lib/chatApi";
import { getSessionId } from "@/lib/sessionId";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

const WAKE_WORD = "jarvis";

const JarvisVoice = () => {
  useAdaptiveTheme();

  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [subtitle, setSubtitle] = useState("Toque na aurora ou diga 'Jarvis'");
  const [activated, setActivated] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [wakeMode, setWakeMode] = useState(false); // listening for wake word only
  const sessionId = useRef(getSessionId());
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const onResultRef = useRef<(t: string) => void>(() => {});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationHistory();
    const interval = setInterval(checkReminders, 30000);
    // Start wake word listening immediately
    setWakeMode(true);
    startListening();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse]);

  const loadConversationHistory = async () => {
    try {
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
        await supabase.from("reminders").update({ completed: true }).eq("id", reminder.id);
        speak(`Senhor, lembrete: ${reminder.title}`, () => {});
        setSubtitle(`🔔 ${reminder.title}`);
      }
    }
  };

  const handleActivate = () => {
    if (activated) return;
    doActivate();
  };

  const doActivate = () => {
    setActivated(true);
    setWakeMode(false);
    setState("speaking");
    setSubtitle("Inicializando...");
    speak("J.A.R.V.I.S. ao seu dispor, senhor.", () => {
      setState("listening");
      setSubtitle("Sempre ouvindo...");
    });
  };

  const handleNavigationCommand = (text: string): boolean => {
    const lower = text.toLowerCase();

    // Open websites
    const openMatch = lower.match(/(?:abrir?|abra|acessar?|acesse|ir para|vai para|open)\s+(.+)/);
    if (openMatch) {
      const site = openMatch[1].trim();
      let url = site;
      if (!url.startsWith("http")) {
        // Try to convert common names
        const siteMap: Record<string, string> = {
          google: "https://www.google.com",
          youtube: "https://www.youtube.com",
          github: "https://www.github.com",
          gmail: "https://mail.google.com",
          twitter: "https://www.twitter.com",
          x: "https://www.x.com",
          instagram: "https://www.instagram.com",
          facebook: "https://www.facebook.com",
          linkedin: "https://www.linkedin.com",
          whatsapp: "https://web.whatsapp.com",
          spotify: "https://open.spotify.com",
          netflix: "https://www.netflix.com",
        };
        const key = Object.keys(siteMap).find(k => site.includes(k));
        if (key) {
          url = siteMap[key];
        } else {
          url = `https://www.${site.replace(/\s+/g, "")}.com`;
        }
      }
      window.open(url, "_blank");
      speak(`Abrindo ${site}, senhor.`, () => {
        setState("listening");
        setSubtitle("Sempre ouvindo...");
      });
      setState("speaking");
      return true;
    }

    // Search
    const searchMatch = lower.match(/(?:pesquisar?|pesquise|buscar?|busque|procurar?|procure|search)\s+(.+)/);
    if (searchMatch) {
      const query = searchMatch[1].trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
      speak(`Pesquisando por ${query}, senhor.`, () => {
        setState("listening");
        setSubtitle("Sempre ouvindo...");
      });
      setState("speaking");
      return true;
    }

    return false;
  };

  const handleVoiceResult = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase().trim();

    // Wake word detection when not activated
    if (!activated || wakeMode) {
      if (lower.includes(WAKE_WORD)) {
        doActivate();
        // If there's more text after the wake word, process it
        const afterWake = lower.split(WAKE_WORD).pop()?.trim();
        if (afterWake && afterWake.length > 3) {
          setTimeout(() => processCommand(afterWake, transcript), 1500);
        }
        return;
      }
      // Not activated and no wake word - ignore
      if (!activated) return;
    }

    processCommand(lower, transcript);
  }, [activated, wakeMode]);

  const processCommand = (lower: string, transcript: string) => {
    // Chat toggle
    if (lower.includes("abrir chat") || lower.includes("mostrar chat") || lower.includes("open chat")) {
      setChatVisible(true);
      speak("Chat ativado, senhor.", () => setState("listening"));
      setState("speaking");
      return;
    }
    if (lower.includes("fechar chat") || lower.includes("esconder chat") || lower.includes("close chat")) {
      setChatVisible(false);
      speak("Chat desativado.", () => setState("listening"));
      setState("speaking");
      return;
    }

    // Navigation commands (handled client-side)
    if (handleNavigationCommand(transcript)) return;

    // All other commands go to AI
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
      sessionId: sessionId.current,
      onDelta: (chunk) => {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      },
      onDone: () => {
        setMessages(prev => [...prev, { role: "assistant", content: fullResponse }]);
        setCurrentResponse("");
        saveMessage("assistant", fullResponse);
        setState("speaking");
        speak(fullResponse, () => {
          setState("listening");
          setSubtitle("Sempre ouvindo...");
        });
      },
      onError: (err) => {
        setState("listening");
        setSubtitle(err);
        speak("Desculpe senhor, encontrei um erro.", () => {
          setState("listening");
          setSubtitle("Sempre ouvindo...");
        });
      },
    });
  };

  onResultRef.current = handleVoiceResult;

  const { startListening, stopListening } = useSpeechRecognition(
    useCallback((t: string) => onResultRef.current(t), [])
  );

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden select-none">
      <VerticalStreaks />
      <FloatingParticles isActive={state === "listening" || state === "speaking"} />

      {/* Main orb */}
      <div className="relative z-10 cursor-pointer" onClick={handleActivate}>
        <AuroraOrb
          isListening={state === "listening"}
          isSpeaking={state === "speaking" || state === "thinking"}
        />
      </div>

      {/* Audio Visualizer */}
      <motion.div
        className="mt-2 sm:mt-4 z-10"
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
        className="mt-3 text-center z-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {!activated && "DIGA 'JARVIS' OU TOQUE"}
          {activated && state === "idle" && "STANDBY"}
          {state === "listening" && "ESCUTANDO"}
          {state === "thinking" && "PROCESSANDO"}
          {state === "speaking" && "RESPONDENDO"}
        </p>
        <p className="text-xs sm:text-sm text-foreground/60 max-w-[280px] sm:max-w-xs mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Bottom controls */}
      <div className="absolute bottom-6 sm:bottom-8 flex items-center gap-4 z-10">
        <motion.div animate={{ opacity: state === "listening" ? 1 : 0.3 }}>
          <div className={`p-2.5 sm:p-3 rounded-full border transition-colors ${
            state === "listening" ? "border-primary/50 bg-primary/10" : "border-border/30 bg-transparent"
          }`}>
            <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${state === "listening" ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatVisible(!chatVisible)}
          className={`p-2.5 sm:p-3 rounded-full border transition-colors ${
            chatVisible ? "border-primary/50 bg-primary/10 text-primary" : "border-border/30 text-muted-foreground hover:border-primary/30"
          }`}
        >
          {chatVisible ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />}
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
            className="absolute bottom-20 sm:bottom-24 left-3 right-3 sm:left-4 sm:right-4 max-w-lg mx-auto max-h-[45vh] overflow-y-auto rounded-xl border border-border/40 bg-card/90 backdrop-blur-xl p-3 sm:p-4 z-20"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase">
                Registro de Conversas
              </p>
              <span className="text-[10px] text-muted-foreground/50">
                {messages.length} mensagens
              </span>
            </div>

            {messages.length === 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground/50 text-center py-4">
                Nenhuma conversa ainda. Fale com o J.A.R.V.I.S.!
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {msg.role === "user" ? "Você" : "J.A.R.V.I.S."}
                </span>
                <div className={`text-xs sm:text-sm mt-0.5 ${msg.role === "user" ? "text-foreground/70" : "text-foreground"}`}>
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
                <div className="text-xs sm:text-sm mt-0.5 text-foreground prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_strong]:text-primary">
                  <ReactMarkdown>{currentResponse}</ReactMarkdown>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JarvisVoice;
