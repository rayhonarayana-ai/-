import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage } from "../types";
import { useLanguageContext } from "../context/LanguageContext";
import { ZakiLanguageSelector } from "./ZakiLanguageSelector";
import { ZakiVoiceSettingsModal } from "./ZakiVoiceSettingsModal";
import { ZakiSpeakingVisualizer } from "./ZakiSpeakingVisualizer";
import { speakText, stopSpeech, replayLastSpeech } from "../data/mascot";
import { ttsManager } from "../data/speech/ttsManager";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  RotateCcw,
  Bot,
  User,
  Trash2,
  HelpCircle,
  Loader2,
  Globe,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

interface ChatAssistantProps {
  onAwardXP: (amount: number, reason: string) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onAwardXP }) => {
  const {
    selectedLanguage,
    selectedPersona,
    voiceConfig,
    isLanguageSelected,
    resetLanguageSelection,
    setIsLanguageModalOpen,
    direction,
    t,
  } = useLanguageContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isSpeakingGlobal, setIsSpeakingGlobal] = useState(ttsManager.isSpeaking);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Synchronize global speaking state
  useEffect(() => {
    const unsub = ttsManager.onSpeakingChange((speaking) => {
      setIsSpeakingGlobal(speaking);
      if (!speaking) {
        setActiveSpeechId(null);
      }
    });
    return unsub;
  }, []);

  // Initialize or re-initialize chat greeting whenever language selection or persona changes
  useEffect(() => {
    if (isLanguageSelected) {
      const personaGreeting =
        selectedPersona.greetingText[selectedLanguage.id] || selectedPersona.greetingText.ar;

      const greetingId = `msg-${Date.now()}`;
      const initMsg: ChatMessage = {
        id: greetingId,
        role: "assistant",
        content: personaGreeting,
        timestamp: new Date().toLocaleTimeString(
          selectedLanguage.speechLang === "fr-FR" ? "fr-FR" : "ar-SA",
          { hour: "2-digit", minute: "2-digit" }
        ),
        mood: "happy",
      };
      setMessages([initMsg]);

      // Auto speak initial greeting with chosen voice and tuned rate
      setActiveSpeechId(greetingId);
      speakText(personaGreeting.slice(0, 160), () => setActiveSpeechId(null), {
        ...voiceConfig,
        lang: selectedLanguage.speechLang,
      });
    }
  }, [isLanguageSelected, selectedLanguage.id, selectedPersona.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString(
        selectedLanguage.speechLang === "fr-FR" ? "fr-FR" : "ar-SA",
        { hour: "2-digit", minute: "2-digit" }
      ),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Stop any prior speech
      stopSpeech();

      // Format chat history for backend
      const formattedHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedHistory,
          language: selectedLanguage.id,
          persona: selectedPersona.id,
          personaPrompt: selectedPersona.personalitySystemPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to assistant.");
      }

      const data = await res.json();
      const replyMsgId = `ast-${Date.now()}`;

      const assistantMsg: ChatMessage = {
        id: replyMsgId,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(
          selectedLanguage.speechLang === "fr-FR" ? "fr-FR" : "ar-SA",
          { hour: "2-digit", minute: "2-digit" }
        ),
        mood: "happy",
      };

      setMessages((prev) => [...prev, assistantMsg]);
      onAwardXP(15, "سؤال الذكاء الاصطناعي");

      // Auto speak response using selected voice, phonetic enhancements, and tuned rate
      setActiveSpeechId(replyMsgId);
      speakText(data.reply.slice(0, 180), () => setActiveSpeechId(null), {
        ...voiceConfig,
        lang: selectedLanguage.speechLang,
      });
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            selectedLanguage.id === "fr"
              ? "Désolé mon ami(e) ! Un petit problème de connexion. Réessaie ! 🚀"
              : selectedLanguage.id === "en"
              ? "Sorry my friend! A quick connection error occurred. Try again! 🚀"
              : "عذراً يا صديقي! حدث تعثر بسيط في شبكة الاتصال بـ Zaki AI. حاول مجدداً! 🚀",
          timestamp: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
          mood: "thinking",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Speech to Text Microphone Integration
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("خاصية التعرف على الصوت غير مدعومة في متصفحك حالياً، يمكنك الكتابة بكتلة النص!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage.speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (activeSpeechId === msgId && isSpeakingGlobal) {
      setActiveSpeechId(null);
      stopSpeech();
    } else {
      setActiveSpeechId(msgId);
      speakText(
        text,
        () => setActiveSpeechId(null),
        {
          ...voiceConfig,
          lang: selectedLanguage.speechLang,
        }
      );
    }
  };

  // If user hasn't selected language yet, show the ZakiLanguageSelector component
  if (!isLanguageSelected) {
    return (
      <div className="flex flex-col h-[740px] max-h-[88vh]">
        <ZakiLanguageSelector />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[740px] max-h-[88vh] bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden relative" dir={direction}>
      {/* Chat Header Bar */}
      <div className={`p-4 sm:p-5 bg-gradient-to-r ${selectedPersona.bgGradient} text-white flex items-center justify-between shadow-md shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-xs shrink-0">
            {selectedPersona.faceEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base sm:text-lg">{selectedPersona.name}</h2>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <p className="text-xs text-indigo-100 font-bold">
              {selectedPersona.title} • <span className="font-black underline">{selectedLanguage.nativeName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaking Wave Status & Stop Button if active */}
          {isSpeakingGlobal && (
            <button
              onClick={() => {
                stopSpeech();
                setActiveSpeechId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 transition text-xs font-black text-white flex items-center gap-1.5 shadow-md cursor-pointer animate-pulse"
              title={t.chat.stopAudio}
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{t.chat.stopAudio}</span>
            </button>
          )}

          {/* Voice & Speed Settings Button */}
          <button
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 transition text-xs font-black text-amber-200 flex items-center gap-1.5 border border-amber-400/40 cursor-pointer"
            title="إعدادات الصوت، السرعة وجودة النطق"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.chat.zakiVoice}</span>
          </button>

          {/* Change Language Button - triggers Header/Global selector */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition text-xs font-black text-white flex items-center gap-1.5 border border-white/30 cursor-pointer"
            title={t.chat.changeLanguage}
          >
            <Globe className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">{t.chat.changeLanguage}</span>
          </button>

          {/* Reset Chat Button */}
          <button
            onClick={() => {
              stopSpeech();
              const personaGreeting =
                selectedPersona.greetingText[selectedLanguage.id] || selectedPersona.greetingText.ar;
              const initMsg: ChatMessage = {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: personaGreeting,
                timestamp: new Date().toLocaleTimeString(
                  selectedLanguage.speechLang === "fr-FR" ? "fr-FR" : "ar-SA",
                  { hour: "2-digit", minute: "2-digit" }
                ),
              };
              setMessages([initMsg]);
            }}
            title={t.chat.clearChat}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-amber-100 cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="flex items-center gap-1 text-xs font-black text-amber-800 shrink-0 px-2">
          <HelpCircle className="w-3.5 h-3.5" /> {t.chat.suggestedQuestions}
        </span>
        {selectedLanguage.suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.text)}
            className="shrink-0 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-2xs hover:scale-105 cursor-pointer"
          >
            {item.text}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isThisMsgSpeaking = activeSpeechId === msg.id && isSpeakingGlobal;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                  isUser
                    ? "bg-purple-600 text-white"
                    : "bg-gradient-to-tr from-amber-400 to-orange-500 text-white"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                <div
                  className={`p-4 rounded-3xl text-sm sm:text-base font-medium leading-relaxed shadow-xs whitespace-pre-line ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tl-none"
                      : isThisMsgSpeaking
                      ? "bg-amber-50 text-slate-900 border-2 border-amber-400/80 rounded-tr-none ring-2 ring-amber-400/20"
                      : "bg-white text-slate-800 border border-slate-200/90 rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>

                <div
                  className={`flex items-center gap-2 text-[11px] font-bold text-slate-400 px-1 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className={`px-2 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                          isThisMsgSpeaking
                            ? "bg-rose-500 text-white font-black animate-pulse"
                            : "bg-amber-100/80 hover:bg-amber-200/90 text-amber-800"
                        }`}
                      >
                        {isThisMsgSpeaking ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>{t.chat.stop}</span>
                            {/* Visual Wave */}
                            <div className="flex items-center gap-0.5 h-2.5">
                              {[8, 14, 10, 16].map((h, i) => (
                                <motion.span
                                  key={i}
                                  className="w-0.5 bg-white rounded-full"
                                  animate={{ height: ["2px", `${h}px`, "2px"] }}
                                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                />
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{t.chat.listen}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          speakText(msg.content, () => setActiveSpeechId(null), {
                            ...voiceConfig,
                            lang: selectedLanguage.speechLang,
                          });
                          setActiveSpeechId(msg.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-200 transition text-slate-500 cursor-pointer"
                        title={t.chat.replay}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl animate-pulse">
              🤖
            </div>
            <div className="p-4 bg-white border border-amber-200 rounded-2xl rounded-tr-none flex items-center gap-2 text-amber-700 text-sm font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>{t.chat.thinking}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box Controls */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
        {/* Speaking Audio Visualizer Footer Strip */}
        <ZakiSpeakingVisualizer onOpenSettings={() => setIsVoiceSettingsOpen(true)} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-1"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? t.chat.listening : "Microphone"}
            className={`p-3 rounded-2xl border transition shadow-2xs cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white border-rose-600 animate-bounce"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t.chat.listening : t.chat.placeholder}
            className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 text-sm sm:text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-2xl transition shadow-md shadow-amber-500/20 font-bold cursor-pointer"
          >
            <Send className={`w-5 h-5 ${direction === "rtl" ? "rotate-180" : ""}`} />
          </button>
        </form>
      </div>

      {/* Voice & Speed Settings Modal */}
      <ZakiVoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
};
