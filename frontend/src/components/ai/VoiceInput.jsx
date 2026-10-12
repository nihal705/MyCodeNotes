import { useEffect, useRef, useState } from "react";
import { FiMic, FiMicOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function VoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";

    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
      if (text) onTranscript?.(text);
    };
    rec.onerror = (e) => {
      if (e.error !== "no-speech") console.error("Speech error:", e.error);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    recRef.current = rec;
  }, [onTranscript]);

  const toggle = () => {
    if (!supported) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (isListening) {
      recRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={supported ? (isListening ? "Stop recording" : "Voice input") : "Voice not supported"}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600"
      }`}
    >
      {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
    </button>
  );
}