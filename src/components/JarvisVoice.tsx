import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import AuroraOrb from "./AuroraOrb";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jarvis-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (e: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || "Request failed");
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

// Web Speech API hook
function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => {
      // Auto-restart to keep always listening
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* already started */ }
      }
    };
    recognition.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      console.error("Speech error:", e.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening };
}

// TTS
function speak(text: string, onEnd?: () => void) {
  const clean = text.replace(/[*#_`]/g, "");
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "pt-BR";
  utterance.rate = 1;
  utterance.pitch = 0.9;
  const voices = speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes("pt-BR") && v.name.toLowerCase().includes("male"))
    || voices.find(v => v.lang.includes("pt-BR"))
    || voices.find(v => v.lang.includes("pt"));
  if (ptVoice) utterance.voice = ptVoice;
  if (onEnd) utterance.onend = onEnd;
  speechSynthesis.speak(utterance);
}

const JarvisVoice = () => {
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [subtitle, setSubtitle] = useState("Toque para falar");
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");

  const handleVoiceResult = useCallback((transcript: string) => {
    // Check if user wants to open chat
    const lower = transcript.toLowerCase();
    if (lower.includes("abrir chat") || lower.includes("mostrar chat") || lower.includes("open chat") || lower.includes("show chat")) {
      setChatVisible(true);
      setSubtitle("Chat aberto");
      speak("Interface de chat ativada, senhor.", () => setState("idle"));
      setState("speaking");
      return;
    }
    if (lower.includes("fechar chat") || lower.includes("esconder chat") || lower.includes("close chat") || lower.includes("hide chat")) {
      setChatVisible(false);
      setSubtitle("Chat fechado");
      speak("Interface de chat desativada, senhor.", () => setState("idle"));
      setState("speaking");
      return;
    }

    setSubtitle(`"${transcript}"`);
    setState("thinking");

    const newMessages: Message[] = [...messages, { role: "user", content: transcript }];
    setMessages(newMessages);

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
        setState("speaking");
        speak(fullResponse, () => {
          setState("idle");
          setSubtitle("Toque para falar");
        });
      },
      onError: (err) => {
        setState("idle");
        setSubtitle(err);
        speak("Me desculpe senhor, encontrei um erro.", () => {
          setState("idle");
          setSubtitle("Toque para falar");
        });
      },
    });
  }, [messages]);

  const { isListening, startListening, stopListening } = useSpeechRecognition(handleVoiceResult);

  const handleOrbClick = () => {
    if (state === "listening" || isListening) {
      stopListening();
      setState("idle");
      setSubtitle("Toque para falar");
    } else if (state === "idle") {
      setState("listening");
      setSubtitle("Ouvindo...");
      startListening();
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsla(187,100%,50%,0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsla(187,100%,50%,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main orb - clickable */}
      <motion.button
        onClick={handleOrbClick}
        className="relative z-10 cursor-pointer focus:outline-none"
        whileTap={{ scale: 0.95 }}
        aria-label="Activate J.A.R.V.I.S."
      >
        <AuroraOrb
          isListening={state === "listening"}
          isSpeaking={state === "speaking" || state === "thinking"}
        />
      </motion.button>

      {/* Status text */}
      <motion.div
        className="mt-8 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-2">
          {state === "idle" && "STANDBY"}
          {state === "listening" && "LISTENING"}
          {state === "thinking" && "PROCESSING"}
          {state === "speaking" && "RESPONDING"}
        </p>
        <p className="text-sm text-foreground/60 max-w-xs mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Mic indicator */}
      <motion.div
        className="absolute bottom-8 z-10"
        animate={{ opacity: state === "listening" ? 1 : 0.3 }}
      >
        <div className={`p-3 rounded-full border ${state === "listening" ? "border-primary/50 bg-primary/10" : "border-border/30 bg-transparent"}`}>
          <Mic className={`w-5 h-5 ${state === "listening" ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </motion.div>

      {/* Chat overlay - only visible when user requests */}
      <AnimatePresence>
        {chatVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-20 left-4 right-4 max-w-lg mx-auto max-h-[40vh] overflow-y-auto rounded-xl border border-border/40 bg-card/90 backdrop-blur-xl p-4 z-20"
          >
            <p className="text-xs text-muted-foreground tracking-wider mb-3 uppercase">Conversation Log</p>
            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {msg.role === "user" ? "You" : "J.A.R.V.I.S."}
                </span>
                <div className={`text-sm mt-0.5 ${msg.role === "user" ? "text-foreground/70" : "text-foreground"}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_strong]:text-primary">
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
