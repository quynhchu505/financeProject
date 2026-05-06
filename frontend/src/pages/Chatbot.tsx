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
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('Lịch sử chat')}</h2>
          <button onClick={createSession} className="rounded-lg bg-primary-50 p-2 text-primary-700 hover:bg-primary-100">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500">{t('Bắt đầu cuộc trò chuyện mới')}</div>
          ) : sessions.map((session) => (
            <div key={session.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${currentSessionId === session.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}`}>
              <button className="flex-1 text-left" onClick={() => loadSession(session.id)}>
                <div className="truncate text-sm font-medium text-gray-800">{session.title}</div>
                <div className="text-xs text-gray-500">{session.message_count} {t('tin')}</div>
              </button>
              <button onClick={() => deleteSession(session.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">{t('Trợ lý Tài chính')}</h1>
        </div>
        {error && <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-green-100 text-green-700'}`}>
                {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`mt-1 text-[10px] ${message.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-400">{t('Đang xử lý...')}</div>}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button key={question} onClick={() => setInput(question)} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700">
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('Hỏi về tài chính cá nhân...')}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="rounded-xl bg-primary-600 px-4 text-white hover:bg-primary-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
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
