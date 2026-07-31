'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ClientInquiryForm({ businessId }: { businessId: string }) {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...formData }),
      });

      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send inquiry.');
      }

      setStatus({ type: 'success', msg: 'Your message has been sent directly to the business owner!' });
      setFormData({ senderName: '', senderEmail: '', senderPhone: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Inquiry submission failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {status && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{status.msg}</span>
        </div>
      )}

      <Input
        label="Your Full Name"
        required
        value={formData.senderName}
        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
        placeholder="Kofi Ansah"
      />
      <Input
        label="Email Address"
        type="email"
        required
        value={formData.senderEmail}
        onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
        placeholder="kofi@example.com"
      />
      <Input
        label="Phone Number"
        type="tel"
        value={formData.senderPhone}
        onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
        placeholder="024XXXXXXX"
      />
      <Input
        label="Subject"
        required
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        placeholder="Product pricing inquiry"
      />
      <Textarea
        label="Message"
        required
        rows={3}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Write your message here..."
      />

      <Button type="submit" variant="primary" isLoading={isLoading} className="w-full gap-2">
        <Send className="w-4 h-4" /> Send Message
      </Button>
    </form>
  );
}
