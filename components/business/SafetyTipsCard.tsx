'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Flag, Ban } from 'lucide-react';
import { Card } from '@/components/ui/card';
import BusinessReportModal from '@/components/business/BusinessReportModal';

interface SafetyTipsCardProps {
  businessId: string;
  businessName: string;
}

export default function SafetyTipsCard({ businessId, businessName }: SafetyTipsCardProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'ABUSE' | 'UNAVAILABLE'>('ABUSE');

  const openReport = (type: 'ABUSE' | 'UNAVAILABLE') => {
    setReportType(type);
    setReportModalOpen(true);
  };

  return (
    <>
      <Card className="p-5 sm:p-6 space-y-4 border-amber-200/80 bg-gradient-to-b from-amber-50/70 to-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">Buyer Safety &amp; Security Tips</h4>
            <p className="text-[11px] text-slate-500">Protect yourself while transacting</p>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Never pay advance fees</strong> for reservations or delivery before seeing the product.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Meet in a safe, public place</strong> like a mall, café, or bustling commercial hub.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Inspect products thoroughly</strong> to ensure condition and functionality match specifications.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Contact through verified phone or WhatsApp listed directly on their profile.</span>
          </li>
        </ul>

        {/* Report Abuse & Mark Unavailable Buttons */}
        <div className="pt-2 border-t border-amber-100/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => openReport('ABUSE')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-[11px] font-bold transition-colors shadow-2xs"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Report Abuse</span>
          </button>
          <button
            type="button"
            onClick={() => openReport('UNAVAILABLE')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-colors shadow-2xs"
          >
            <Ban className="w-3.5 h-3.5 text-amber-600" />
            <span>Mark Unavailable</span>
          </button>
        </div>
      </Card>

      {reportModalOpen && (
        <BusinessReportModal
          businessId={businessId}
          businessName={businessName}
          initialType={reportType}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </>
  );
}
