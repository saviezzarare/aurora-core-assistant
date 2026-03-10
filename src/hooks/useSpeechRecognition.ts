import { useState, useRef, useCallback, useEffect } from "react";

export function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const [isListening, setIsListening] = useState(false);
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            onResultRef.current(transcript);
          }
        }
      }
    };

    recognition.onend = () => {
      console.log("[SpeechRecognition] ended, shouldRestart:", shouldBeListeningRef.current);
      if (shouldBeListeningRef.current) {
        // Auto-restart after a brief delay
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log("[SpeechRecognition] restarted");
            } catch (e) {
              console.warn("[SpeechRecognition] restart failed, recreating", e);
              // Recreate if start fails
              recognitionRef.current = createRecognition();
              if (recognitionRef.current) {
                try { recognitionRef.current.start(); } catch {}
              }
            }
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("[SpeechRecognition] error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-available") {
        shouldBeListeningRef.current = false;
        setIsListening(false);
        return;
      }
      // For recoverable errors (no-speech, aborted, network), let onend handle restart
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    if (shouldBeListeningRef.current) return; // Already listening
    shouldBeListeningRef.current = true;

    const recognition = createRecognition();
    if (!recognition) {
      console.error("[SpeechRecognition] Not supported in this browser");
      shouldBeListeningRef.current = false;
      return;
    }

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      console.log("[SpeechRecognition] started");
    } catch (e) {
      console.error("[SpeechRecognition] start error:", e);
      shouldBeListeningRef.current = false;
    }
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    console.log("[SpeechRecognition] stopped");
  }, []);

  return { isListening, startListening, stopListening };
}
