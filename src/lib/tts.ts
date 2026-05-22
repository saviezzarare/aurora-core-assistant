import { supabase } from "@/integrations/supabase/client";

let currentAudio: HTMLAudioElement | null = null;
let speaking = false;
let elevenLabsAvailable = true; // desabilita após falhas repetidas na sessão
let consecutiveFailures = 0;

const VOICE_ID =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ||
  "qSeXEcewz7tA0Q0qk9fH";

function sanitizeText(text: string) {
  return text
    .replace(/[*#_`]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function browserSpeak(text: string, onEnd?: () => void) {
  try {
    speechSynthesis.cancel();
  } catch {}
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 1;
  utterance.pitch = 0.95;
  utterance.volume = 1;

  const voices = speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.name.toLowerCase().includes("antonio")) ||
    voices.find((v) => v.name.toLowerCase().includes("felipe")) ||
    voices.find((v) => v.name.toLowerCase().includes("google português")) ||
    voices.find((v) => v.lang === "pt-BR") ||
    voices.find((v) => v.lang.startsWith("pt"));

  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.onstart = () => {
    speaking = true;
  };
  utterance.onend = () => {
    speaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
  };

  speechSynthesis.speak(utterance);
}

export async function speak(text: string, onEnd?: () => void) {
  const clean = sanitizeText(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  stopSpeaking();

  if (!elevenLabsAvailable) {
    return browserSpeak(clean, onEnd);
  }

  try {
    speaking = true;
    const { data, error } = await supabase.functions.invoke("tts-elevenlabs", {
      body: { text: clean, voiceId: VOICE_ID },
    });

    if (error) throw new Error(error.message || "Falha ao chamar TTS");

    // supabase.functions.invoke retorna Blob para audio/mpeg
    const blob =
      data instanceof Blob
        ? data
        : new Blob([data as ArrayBuffer], { type: "audio/mpeg" });

    if (!blob.size) throw new Error("Áudio vazio");

    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.preload = "auto";

    currentAudio.onended = () => {
      speaking = false;
      URL.revokeObjectURL(url);
      currentAudio = null;
      onEnd?.();
    };
    currentAudio.onerror = () => {
      speaking = false;
      URL.revokeObjectURL(url);
      currentAudio = null;
      onEnd?.();
    };

    await currentAudio.play();
    consecutiveFailures = 0;
    console.log("[TTS] ElevenLabs ✓");
  } catch (err) {
    consecutiveFailures += 1;
    console.error("[TTS] Falha ElevenLabs, usando fallback:", err);
    if (consecutiveFailures >= 3) {
      elevenLabsAvailable = false;
      console.warn("[TTS] ElevenLabs desabilitado nesta sessão após 3 falhas.");
    }
    speaking = false;
    browserSpeak(clean, onEnd);
  }
}

export function stopSpeaking() {
  try {
    speechSynthesis.cancel();
  } catch {}
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}

export function resetTTS() {
  elevenLabsAvailable = true;
  consecutiveFailures = 0;
}
