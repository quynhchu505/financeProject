import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquarePlus, Send, Trash2, User } from 'lucide-react';

import { api } from '@/services/api';
import { ChatMessage, ChatSession, ChatSessionDetail } from '@/types';
import { useI18n } from '@/i18n';

export default function Chatbot() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage(t)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const data = await api.getChatSessions();
      setSessions(data as ChatSession[]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      const data = await api.getChatSession(sessionId) as ChatSessionDetail;
      const nextMessages: ChatMessage[] = data.messages.flatMap((item) => ([
        {
          id: `${item.id}-user`,
          role: 'user',
          content: item.message,
          timestamp: new Date(item.created_at),
        },
        {
          id: `${item.id}-bot`,
          role: 'bot',
          content: item.response,
          timestamp: new Date(item.created_at),
        },
      ]));
      setCurrentSessionId(sessionId);
      setMessages(nextMessages.length > 0 ? nextMessages : [welcomeMessage(t)]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const createSession = async () => {
    try {
      const session = await api.createChatSession() as ChatSession;
      setSessions((prev) => [session, ...prev]);
      setCurrentSessionId(session.id);
      setMessages([welcomeMessage(t)]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const deleteSession = async (id: number) => {
    try {
      await api.deleteChatSession(id);
      setSessions((prev) => prev.filter((session) => session.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setMessages([welcomeMessage(t)]);
      }
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.chat(text, currentSessionId ?? undefined) as { response: string; session_id?: number };
      if (result.session_id && result.session_id !== currentSessionId) {
        setCurrentSessionId(result.session_id);
        await loadSessions();
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          role: 'bot',
          content: result.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setError(err.message || t('Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    t('Làm sao để tiết kiệm hiệu quả?'),
    t('Quỹ khẩn cấp nên có bao nhiêu?'),
    t('Mẹo quản lý chi tiêu hàng tháng?'),
    t('Đầu tư gì cho người mới bắt đầu?'),
  ];

  return (
    <div className="grid gap-xl lg:grid-cols-[280px_1fr] font-ui h-full">
      <aside className="rounded-card bg-white p-xl shadow-elevated border border-gray-border animate-fade-in-up">
        <div className="mb-lg flex items-center justify-between">
          <h2 className="font-ui font-medium text-[18px] text-charcoal">{t('Lịch sử chat')}</h2>
          <button onClick={createSession} className="rounded-standard bg-offwhite-1 p-2 text-charcoal border border-gray-border hover:bg-offwhite-2 shadow-raised transition-colors">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-sm max-h-[calc(100vh-250px)] overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="rounded-standard bg-offwhite-1 px-md py-lg text-[14px] text-gray-medium text-center border border-gray-border">{t('Bắt đầu cuộc trò chuyện mới')}</div>
          ) : sessions.map((session) => (
            <div key={session.id} className={`flex items-start gap-2 rounded-standard border px-md py-sm transition-colors ${currentSessionId === session.id ? 'border-primary/50 bg-primary/5' : 'border-gray-border hover:bg-offwhite-1'}`}>
              <button className="flex-1 text-left min-w-0" onClick={() => loadSession(session.id)}>
                <div className="truncate text-[15px] font-medium text-charcoal">{session.title}</div>
                <div className="text-[12px] text-gray-dark mt-0.5">{session.message_count} {t('tin')}</div>
              </button>
              <button onClick={() => deleteSession(session.id)} className="rounded-standard p-1.5 text-gray-medium hover:bg-semantic-error/10 hover:text-semantic-error transition-colors flex-shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-col h-[calc(100vh-140px)] rounded-card bg-white shadow-elevated border border-gray-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="border-b border-gray-border px-xl py-md bg-offwhite-1 rounded-t-card">
          <h1 className="font-display text-[24px] text-charcoal">{t('Trợ lý Tài chính')}</h1>
        </div>
        {error && <div className="mx-xl mt-md rounded-standard border border-semantic-error/20 bg-semantic-error/5 px-lg py-md text-[14px] text-semantic-error">{error}</div>}
        
        <div className="flex-1 space-y-xl overflow-y-auto p-xl">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-md ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-raised ${message.role === 'user' ? 'bg-primary text-white' : 'bg-charcoal text-white'}`}>
                {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-xl py-md text-[15px] shadow-raised ${message.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-offwhite-1 text-charcoal border border-gray-border rounded-tl-sm'}`}>
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className={`mt-2 text-[11px] ${message.role === 'user' ? 'text-primary-100' : 'text-gray-medium'}`}>
                  {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-md animate-fade-in">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-raised bg-charcoal text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-xl py-md text-[15px] shadow-raised bg-offwhite-1 text-charcoal border border-gray-border rounded-tl-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-medium animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-medium animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-medium animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-xl pb-md">
            <div className="flex flex-wrap gap-sm">
              {quickQuestions.map((question) => (
                <button key={question} onClick={() => setInput(question)} className="rounded-pill border border-gray-border bg-white px-lg py-sm text-[13px] text-charcoal shadow-raised hover:bg-offwhite-1 transition-colors">
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-border p-xl bg-offwhite-1 rounded-b-card">
          <div className="flex gap-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('Hỏi về tài chính cá nhân...')}
              className="flex-1 rounded-pill border border-gray-border bg-white px-lg py-sm text-[15px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 shadow-raised h-[44px] text-charcoal placeholder-gray-medium transition-all"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="flex items-center justify-center rounded-pill bg-primary w-[44px] h-[44px] text-white hover:bg-primary-hover active:bg-primary disabled:opacity-50 disabled:bg-gray-medium transition-colors shadow-raised">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function welcomeMessage(t: (key: string) => string): ChatMessage {
  return {
    id: 'welcome',
    role: 'bot',
    content: t('chatbot_welcome_title') + t('chatbot_welcome_bullets'),
    timestamp: new Date(),
  };
}
