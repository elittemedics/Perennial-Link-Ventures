'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, User, Package, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  productId: string;
  senderId: string;
  receiverId?: string | null;
  sender: { id: string; name: string | null; image: string | null; email?: string | null };
  receiver?: { id: string; name: string | null; image: string | null } | null;
  product?: { id: string; title: string; price: number; image?: string | null } | null;
}

interface OwnerMessagesSectionProps {
  businessId: string;
  businessName: string;
}

export default function OwnerMessagesSection({ businessId, businessName }: OwnerMessagesSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [replyText, setReplyText] = useState<{ [clientId: string]: string }>({});
  const [replying, setReplying] = useState<{ [clientId: string]: boolean }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/v1/owner/messages?businessId=${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success) {
          setMessages(data.messages || []);
          setIsOwner(data.isOwner || false);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Also get current user
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (mounted && d?.data?.user) setCurrentUserId(d.data.user.id);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, [businessId]);

  if (loading || !isOwner) {
    return null;
  }

  // Group messages by client thread (client is sender who is not the owner)
  const threadsByClient: { [clientId: string]: { client: any; messages: Message[]; product?: any } } = {};

  messages.forEach((msg) => {
    const isSentByOwner = msg.senderId === currentUserId;
    const clientId = isSentByOwner ? msg.receiverId : msg.senderId;
    if (!clientId) return;

    if (!threadsByClient[clientId]) {
      const clientInfo = isSentByOwner ? msg.receiver : msg.sender;
      threadsByClient[clientId] = {
        client: clientInfo || { id: clientId, name: 'Client' },
        messages: [],
        product: msg.product,
      };
    }
    threadsByClient[clientId].messages.push(msg);
    if (msg.product && !threadsByClient[clientId].product) {
      threadsByClient[clientId].product = msg.product;
    }
  });

  const clientIds = Object.keys(threadsByClient);

  const handleSendReply = async (clientId: string, productId?: string) => {
    const text = (replyText[clientId] || '').trim();
    if (!text) return;

    setReplying((prev) => ({ ...prev, [clientId]: true }));

    try {
      const res = await fetch('/api/v1/owner/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          receiverId: clientId,
          productId,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, data.reply]);
        setReplyText((prev) => ({ ...prev, [clientId]: '' }));
      }
    } catch {
      // error
    } finally {
      setReplying((prev) => ({ ...prev, [clientId]: false }));
    }
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6 border-sea/30 bg-gradient-to-b from-sky-50/50 to-white shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sky-100 pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sea text-white flex items-center justify-center font-bold shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">Client Inquiries &amp; Messages</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-sea text-white px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Owner View
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Direct inquiries sent by customers for {businessName}. Reply directly below.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs w-fit">
          {clientIds.length} {clientIds.length === 1 ? 'Client Conversation' : 'Client Conversations'}
        </span>
      </div>

      {clientIds.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <p className="text-sm font-semibold">No direct messages received yet.</p>
          <p className="text-xs text-slate-400">
            When customers click &quot;Direct Message&quot; on your products, their messages will appear here and you can reply to them immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {clientIds.map((clientId) => {
            const thread = threadsByClient[clientId];
            const clientName = thread.client?.name || 'Verified Client';
            const clientInitial = clientName[0]?.toUpperCase() || 'C';

            return (
              <div
                key={clientId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Client & Product Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-navy text-white font-bold text-xs flex items-center justify-center">
                      {clientInitial}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{clientName}</h4>
                      {thread.client?.email && (
                        <p className="text-[10px] text-slate-400">{thread.client.email}</p>
                      )}
                    </div>
                  </div>

                  {thread.product && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                      <Package className="w-3.5 h-3.5 text-sea shrink-0" />
                      <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                        {thread.product.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message Log */}
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto bg-slate-50/30">
                  {thread.messages.map((m) => {
                    const isFromOwner = m.senderId === currentUserId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isFromOwner ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            isFromOwner
                              ? 'bg-sea text-white rounded-tr-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <p className="font-semibold text-[10px] mb-1 opacity-80">
                            {isFromOwner ? 'You (Owner)' : clientName}
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

                {/* Reply Input */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText[clientId] || ''}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [clientId]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendReply(clientId, thread.product?.id);
                      }
                    }}
                    placeholder={`Reply to ${clientName}...`}
                    disabled={replying[clientId]}
                    className="flex-1 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sea/20 focus:border-sea outline-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={replying[clientId] || !replyText[clientId]?.trim()}
                    onClick={() => handleSendReply(clientId, thread.product?.id)}
                    className="gap-1.5 bg-sea hover:bg-sky-600 text-white font-bold text-xs"
                  >
                    {replying[clientId] ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Reply</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
