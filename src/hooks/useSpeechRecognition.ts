import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Reconhecimento de voz robusto:
 * - Evita start duplicado (InvalidStateError)
 * - Backoff exponencial em erros de "network"
 * - Pausa após muitas falhas consecutivas e retoma quando a conexão volta
 * - Reinício suave em "no-speech" / "aborted"
 */
export function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [isListening, setIsListening] = useState(false);
  const shouldBeListeningRef = useRef(false);
  const isActiveRef = useRef(false); // true entre onstart e onend
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const networkErrorsRef = useRef(0);
  const pausedRef = useRef(false);

  const clearRestartTimer = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      clearRestartTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Retoma quando a internet voltar
  useEffect(() => {
    const onOnline = () => {
      if (pausedRef.current && shouldBeListeningRef.current) {
        console.log("[SpeechRecognition] online: retomando");
        pausedRef.current = false;
        networkErrorsRef.current = 0;
        scheduleRestart(500);
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const safeStart = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isActiveRef.current) return; // já está rodando
    try {
      rec.start();
    } catch (e: any) {
      if (e?.name === "InvalidStateError") {
        // já estava ativo; ignora
        return;
      }
      console.warn("[SpeechRecognition] start error, recriando", e);
      recognitionRef.current = createRecognitionInstance();
      try {
        recognitionRef.current?.start();
      } catch {}
    }
  }, []);

  const scheduleRestart = useCallback(
    (delay: number) => {
      clearRestartTimer();
      restartTimeoutRef.current = setTimeout(() => {
        if (!shouldBeListeningRef.current || pausedRef.current) return;
        safeStart();
      }, delay);
    },
    [safeStart],
  );

  const createRecognitionInstance = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onstart = () => {
      isActiveRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) onResultRef.current(transcript);
        }
      }
    };

    recognition.onend = () => {
      isActiveRef.current = false;
      if (!shouldBeListeningRef.current || pausedRef.current) {
        setIsListening(false);
        return;
      }
      // Reinício com pequeno delay para evitar loops apertados
      scheduleRestart(400);
    };

    recognition.onerror = (e: any) => {
      const code = e?.error;
      if (code === "not-allowed" || code === "service-not-available") {
        console.warn("[SpeechRecognition] sem permissão/serviço:", code);
        shouldBeListeningRef.current = false;
        setIsListening(false);
        return;
      }

      if (code === "network") {
        networkErrorsRef.current += 1;
        // backoff exponencial: 1s, 2s, 4s, 8s (máx 15s)
        const delay = Math.min(
          1000 * Math.pow(2, networkErrorsRef.current - 1),
          15000,
        );
        if (networkErrorsRef.current >= 5) {
          console.warn(
            "[SpeechRecognition] muitas falhas de rede, pausando até voltar online",
          );
          pausedRef.current = true;
          setIsListening(false);
          return;
        }
        console.warn(
          `[SpeechRecognition] network error (${networkErrorsRef.current}), retry em ${delay}ms`,
        );
        clearRestartTimer();
        // onend será disparado em seguida; agendamos aqui também como segurança
        scheduleRestart(delay);
        return;
      }

      if (code === "no-speech" || code === "aborted" || code === "audio-capture") {
        // Recuperáveis; onend cuida do restart
        return;
      }

      console.warn("[SpeechRecognition] erro:", code);
    };

    return recognition;
  }, [scheduleRestart]);

  const startListening = useCallback(() => {
    if (shouldBeListeningRef.current) return;
    shouldBeListeningRef.current = true;
    pausedRef.current = false;
    networkErrorsRef.current = 0;

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognitionInstance();
    }
    if (!recognitionRef.current) {
      console.error("[SpeechRecognition] não suportado neste navegador");
      shouldBeListeningRef.current = false;
      return;
    }
    safeStart();
  }, [createRecognitionInstance, safeStart]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    pausedRef.current = false;
    clearRestartTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening };
}
