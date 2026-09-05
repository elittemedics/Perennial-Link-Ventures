'use client';

import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle, Ban, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessReportModalProps {
  businessId: string;
  businessName: string;
  initialType?: 'ABUSE' | 'UNAVAILABLE';
  onClose: () => void;
}

export default function BusinessReportModal({
  businessId,
  businessName,
  initialType = 'ABUSE',
  onClose,
}: BusinessReportModalProps) {
  const [reportType, setReportType] = useState<'ABUSE' | 'UNAVAILABLE'>(initialType);
  const [reason, setReason] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a brief explanation for your report.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/businesses/${businessId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          reason,
          reporterName,
          reporterEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              {reportType === 'UNAVAILABLE' ? <Ban className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {reportType === 'UNAVAILABLE' ? 'Mark Business / Product as Unavailable' : 'Report Abuse or Fraud'}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{businessName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-lg">Report Received</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for helping keep Perennial Link Ventures trustworthy and accurate. Our moderation team will investigate this business listing.
              </p>
            </div>
            <Button onClick={onClose} variant="primary" className="mt-2 text-xs">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Toggle Report Type */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setReportType('ABUSE')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  reportType === 'ABUSE'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                Report Abuse
              </button>
              <button
                type="button"
                onClick={() => setReportType('UNAVAILABLE')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  reportType === 'UNAVAILABLE'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-amber-600" />
                Mark Unavailable
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                {reportType === 'UNAVAILABLE'
                  ? 'Details (e.g. Out of stock, business permanently closed, wrong contact)'
                  : 'Describe the issue or reason for reporting'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  reportType === 'UNAVAILABLE'
                    ? 'e.g. I contacted the seller and they said this item is sold out, or the phone number is out of service.'
                    : 'e.g. Suspicious pricing, counterfeit goods, fraudulent payment requests, or impersonation.'
                }
                rows={3}
                required
                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-sea/20 focus:border-sea outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Your Name (optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sea/20 focus:border-sea outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Your Email / Phone (optional)</label>
                <input
                  type="text"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="e.g. contact@email.com"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-sea/20 focus:border-sea outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className={
                  reportType === 'ABUSE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold'
                    : 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                }
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : reportType === 'ABUSE' ? (
                  'Submit Abuse Report'
                ) : (
                  'Mark as Unavailable'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
