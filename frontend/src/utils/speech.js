const getSpeechSynthesis = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.speechSynthesis || null;
};

const getEnglishVoice = (synthesis) => {
  const voices = synthesis.getVoices();

  return (
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
    undefined
  );
};

export const isSupported = () => Boolean(getSpeechSynthesis());

export const speak = (text) => {
  const synthesis = getSpeechSynthesis();

  if (!synthesis || !text) {
    return;
  }

  synthesis.cancel();

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voice = getEnglishVoice(synthesis);

  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = 0.95;
  utterance.pitch = 1;
  synthesis.speak(utterance);
};

export const stop = () => {
  getSpeechSynthesis()?.cancel();
};

const speechSynthesis = getSpeechSynthesis();

if (speechSynthesis) {
  speechSynthesis.addEventListener("voiceschanged", () => {
    speechSynthesis.getVoices();
  });
}
