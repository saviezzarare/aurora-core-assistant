let currentAudio: HTMLAudioElement | null = null;
let speaking = false;

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
const VOICE_ID =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ||
  "TxGEqnHWrfWFTfGW9XjX";

console.log(
  "[TTS] ElevenLabs config:",
  API_KEY ? `key=***${API_KEY.slice(-4)}` : "NO KEY",
  "voice=",
  VOICE_ID
);

function sanitizeText(text: string) {
  return text
    .replace(/[*#_`]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function browserSpeak(text: string, onEnd?: () => void) {
  speechSynthesis.cancel();
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

  utterance.onstart = () => { speaking = true; };
  utterance.onend = () => { speaking = false; onEnd?.(); };
  utterance.onerror = () => { speaking = false; onEnd?.(); };

  speechSynthesis.speak(utterance);
}

export async function speak(text: string, onEnd?: () => void) {
  const clean = sanitizeText(text);
  if (!clean) { onEnd?.(); return; }

  stopSpeaking();

  if (!API_KEY) {
    console.warn("[TTS] VITE_ELEVENLABS_API_KEY ausente. Usando voz local.");
    return browserSpeak(clean, onEnd);
  }

  try {
    speaking = true;
    console.log("[TTS] Solicitando ElevenLabs…", { voice: VOICE_ID, len: clean.length });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": API_KEY,
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.9,
            style: 0.65,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs ${response.status}: ${errText}`);
    }

    const blob = await response.blob();
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
    console.log("[TTS] Reproduzindo voz ElevenLabs ✓");
  } catch (error) {
    console.error("[TTS] Erro ElevenLabs, usando fallback do navegador:", error);
    speaking = false;
    browserSpeak(clean, onEnd);
  }
}

export function stopSpeaking() {
  speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}
