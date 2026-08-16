'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, type CountryData } from '@/lib/countries-data';

type Props = { value: string; onChange: (country: CountryData) => void; mode?: 'country' | 'dialCode'; className?: string };

export function CountrySelect({ value, onChange, mode = 'country', className = '' }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? COUNTRIES.filter((country) => `${country.name} ${country.code} ${country.phoneCode}`.toLowerCase().includes(term)) : COUNTRIES;
  }, [query]);
  const selected = COUNTRIES.find((country) => (mode === 'country' ? country.name : country.phoneCode) === value);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return <div ref={containerRef} className={`relative ${className}`}>
    <div className="flex items-center rounded-lg border border-slate-300 bg-white px-2.5 focus-within:border-sea focus-within:ring-2 focus-within:ring-sea/20">
      {selected ? <img src={selected.flagUrl} alt={`${selected.name} flag`} className="mr-2 h-4 w-6 shrink-0 rounded-sm object-cover" /> : <span className="mr-2">🌐</span>}
      <input type="search" value={query} onFocus={() => setIsOpen(true)} onClick={() => setIsOpen(true)} onChange={(event) => { setQuery(event.target.value); setIsOpen(true); }} placeholder={mode === 'country' ? selected?.name || 'Search country' : selected?.phoneCode || 'Code'} aria-label={mode === 'country' ? 'Search country' : 'Search country dial code'} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none" />
    </div>
    {isOpen && <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
      {items.map((country) => <button key={country.code} type="button" onClick={() => { onChange(country); setQuery(''); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50">
        <img src={country.flagUrl} alt="" className="h-4 w-6 shrink-0 rounded-sm object-cover" /><span className="min-w-0 flex-1 truncate">{country.name}</span>{mode === 'dialCode' && <span className="text-slate-500">{country.phoneCode}</span>}
      </button>)}
      {items.length === 0 && <p className="px-3 py-2 text-sm text-slate-500">No matching country.</p>}
    </div>}
  </div>;
}
