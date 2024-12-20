// Utilidades para el manejo de texto y voz
export const padWordsToMatch = (words1: string[], words2: string[]): [string[], string[]] => {
  const maxLength = Math.max(words1.length, words2.length);
  const paddedWords1 = [...words1];
  const paddedWords2 = [...words2];

  for (let i = 0; i < maxLength; i++) {
    if (paddedWords2[i]?.length > (paddedWords1[i]?.length || 0)) {
      if (paddedWords1[i]) {
        paddedWords1[i] = paddedWords1[i].padEnd(paddedWords2[i].length);
      }
    }
  }

  return [paddedWords1, paddedWords2];
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (
  text: string,
  onWordChange: (index: number) => void,
  speed: number = 1,
  voice: SpeechSynthesisVoice | null = null
) => {
  return new Promise<void>((resolve) => {
    if (currentUtterance) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;
    
    utterance.rate = speed;
    utterance.lang = 'en-US';
    if (voice) utterance.voice = voice;

    let wordIndex = 0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        onWordChange(wordIndex);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };

    speechSynthesis.speak(utterance);
  });
};

export const pauseSpeech = () => {
  speechSynthesis.pause();
};

export const resumeSpeech = () => {
  speechSynthesis.resume();
};

export const stopSpeech = () => {
  speechSynthesis.cancel();
  currentUtterance = null;
};