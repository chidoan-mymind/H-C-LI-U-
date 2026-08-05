import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles, Volume2 } from 'lucide-react';
import { speechManager } from '../utils/speech';
import { soundManager } from '../utils/sound';
import { StudentInfo } from '../types';

interface ChatWithThanDinhDuongProps {
  student: StudentInfo;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'than' | 'user';
  text: string;
}

export const ChatWithThanDinhDuong: React.FC<ChatWithThanDinhDuongProps> = ({ student, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'than',
      text: `Chào nhà khám phá nhỏ ${student.name || 'bạn nhỏ'}! Ta là Thần Dinh Dưỡng đây! 🍎 Con có thắc mắc gì về thức ăn, sức khỏe hay mẹo ăn uống giúp thông minh, cao lớn hơn không? Hãy hỏi Thần nhé!`
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Ăn gì để cao lớn và thông minh hơn hả Thần?",
    "Tại sao lại phải ăn rau củ quả hằng ngày ạ?",
    "Bánh kẹo ngọt có tốt cho sức khỏe không ạ?",
    "Làm sao để hệ tiêu hóa luôn khỏe mạnh ạ?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    soundManager.playClick();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: prompt.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/than-dinh-duong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          studentName: student.name,
          studentGrade: student.grade
        })
      });

      const data = await res.json();
      setIsLoading(false);

      const replyText = data.reply || "Thần Dinh Dưỡng luôn chúc con ăn ngon miệng và luôn khỏe mạnh!";
      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: 'than', text: replyText };
      setMessages((prev) => [...prev, botMsg]);

      // Speak answer if speech voice enabled
      speechManager.speak(replyText);
    } catch (e) {
      setIsLoading(false);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'than',
        text: `Ôi vui quá ${student.name}! Con hãy luôn ghi nhớ ăn đủ 4 nhóm chất dinh dưỡng và chăm tập thể thao để lúc nào cũng cao lớn và tràn đầy năng lượng nhé! 🍎🥦`
      };
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const handleSpeakText = (text: string) => {
    speechManager.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0A2F1F] text-white w-full max-w-xl h-[85vh] rounded-[40px] border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Chat Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/10 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-emerald-950 flex items-center justify-center text-2xl shadow-md font-bold">
              🧙‍♂️
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg flex items-center gap-1.5 text-white">
                Góc Trò Chuyện Cùng Thần Dinh Dưỡng
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">Hỏi đáp vui cùng AI dành cho học sinh lớp 4</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            title="Đóng chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
          {messages.map((msg) => {
            const isThan = msg.sender === 'than';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isThan ? 'justify-start' : 'justify-end'}`}
              >
                {isThan && (
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-base font-bold shadow-xs flex-shrink-0 mt-1">
                    🧙‍♂️
                  </div>
                )}

                <div
                  className={`p-4 rounded-3xl max-w-[82%] text-sm font-medium leading-relaxed shadow-sm relative group ${
                    isThan
                      ? 'bg-white/10 backdrop-blur-md text-white border border-white/15 rounded-tl-none'
                      : 'bg-gradient-to-r from-emerald-400 to-lime-400 text-emerald-950 font-bold rounded-tr-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  {isThan && (
                    <button
                      onClick={() => handleSpeakText(msg.text)}
                      className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-400 text-emerald-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1 cursor-pointer opacity-90 hover:scale-105"
                      title="Đọc câu này"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!isThan && (
                  <div className="w-9 h-9 rounded-2xl bg-yellow-400 text-yellow-950 flex items-center justify-center text-base font-black shadow-xs flex-shrink-0 mt-1">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-200 italic p-3 bg-white/10 rounded-2xl border border-white/15 w-fit">
              <span>🧙‍♂️ Thần Dinh Dưỡng đang suy nghĩ câu trả lời...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-black/30 border-t border-white/10 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-emerald-500/30 border border-white/15 text-emerald-200 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cho Thần Dinh Dưỡng ở đây..."
              className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white placeholder-emerald-200/50 text-sm font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3.5 bg-gradient-to-r from-emerald-400 to-lime-400 hover:from-emerald-300 hover:to-lime-300 disabled:opacity-40 text-emerald-950 rounded-2xl transition-all cursor-pointer shadow-md font-bold"
            >
              <Send className="w-5 h-5 text-emerald-950" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
