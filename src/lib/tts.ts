export function speak(text: string, onEnd?: () => void) {
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
