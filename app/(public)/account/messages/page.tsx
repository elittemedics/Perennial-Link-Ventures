'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Building2, Package, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  productId: string;
  senderId: string;
  receiverId?: string | null;
  sender: { id: string; name: string | null; image: string | null; email?: string | null };
  receiver?: { id: string; name: string | null; image: string | null } | null;
  product?: {
    id: string;
    title: string;
    price: number;
    image?: string | null;
    business?: { id: string; name: string; slug: string; ownerId: string } | null;
  } | null;
}

export default function AccountMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [threadKey: string]: string }>({});
  const [sending, setSending] = useState<{ [threadKey: string]: boolean }>({});

  useEffect(() => {
    fetch('/api/v1/account/messages')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login?next=/account/messages';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setMessages(data.messages || []);
          setCurrentUserId(data.currentUserId || null);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  // Group messages into conversations by (productId, otherParticipantId)
  const threads: {
    [key: string]: {
      otherParty: { id: string; name: string | null; email?: string | null };
      product?: any;
      business?: any;
      messages: Message[];
    };
  } = {};

  messages.forEach((msg) => {
    const isMeSender = msg.senderId === currentUserId;
    const otherId = isMeSender ? msg.receiverId || msg.product?.business?.ownerId : msg.senderId;
    if (!otherId) return;

    const threadKey = `${msg.productId || 'general'}_${otherId}`;
    if (!threads[threadKey]) {
      const otherInfo = isMeSender ? msg.receiver || { id: otherId, name: msg.product?.business?.name || 'Seller' } : msg.sender;
      threads[threadKey] = {
        otherParty: otherInfo,
        product: msg.product,
        business: msg.product?.business,
        messages: [],
      };
    }
    threads[threadKey].messages.push(msg);
  });

  const threadKeys = Object.keys(threads);

  const handleSend = async (threadKey: string, thread: any) => {
    const text = (replyText[threadKey] || '').trim();
    if (!text || !currentUserId) return;

    setSending((prev) => ({ ...prev, [threadKey]: true }));

    try {
      const res = await fetch(`/api/v1/products/${thread.product?.id || 'general'}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyText((prev) => ({ ...prev, [threadKey]: '' }));
      }
    } catch {
      // error
    } finally {
      setSending((prev) => ({ ...prev, [threadKey]: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-navy flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Messages &amp; Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Communicate directly with sellers and view replies to your inquiries.
          </p>
        </div>
        <Badge variant="info" className="w-fit">
          {threadKeys.length} Active {threadKeys.length === 1 ? 'Conversation' : 'Conversations'}
        </Badge>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sea mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading your messages...</p>
        </div>
      ) : threadKeys.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sea flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No messages yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you browse products and click &quot;Direct Message&quot; to contact a business, your conversations and seller replies will appear right here.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button size="sm" variant="primary" className="text-xs font-bold">
                Explore Products &amp; Businesses
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {threadKeys.map((key) => {
            const thread = threads[key];
            const otherName = thread.otherParty?.name || 'Contact';

            return (
              <Card key={key} className="overflow-hidden border-slate-200 shadow-sm">
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-navy text-white font-bold text-xs flex items-center justify-center">
                      {otherName[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{otherName}</h3>
                      {thread.business && (
                        <Link
                          href={`/business/${thread.business.slug}`}
                          className="text-[11px] text-sea hover:underline font-semibold flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>{thread.business.name}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {thread.product && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1 text-xs">
                      <Package className="w-3.5 h-3.5 text-sea shrink-0" />
                      <span className="font-bold text-slate-800 line-clamp-1 max-w-[240px]">
                        {thread.product.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message History */}
                <div className="p-4 sm:p-6 space-y-3 max-h-72 overflow-y-auto bg-slate-50/40">
                  {thread.messages.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                            isMe
                              ? 'bg-sea text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <p className="font-semibold text-[10px] mb-1 opacity-80">
                            {isMe ? 'You' : otherName}
                          </p>
                          <p className="whitespace-pre-line">{m.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDate(m.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply */}
                {thread.product && (
                  <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText[key] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend(key, thread);
                      }}
                      placeholder={`Reply to ${otherName}...`}
                      disabled={sending[key]}
                      className="flex-1 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sea/20 focus:border-sea outline-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={sending[key] || !replyText[key]?.trim()}
                      onClick={() => handleSend(key, thread)}
                      className="gap-1.5 bg-sea hover:bg-sky-600 text-white font-bold text-xs"
                    >
                      {sending[key] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send</span>
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
