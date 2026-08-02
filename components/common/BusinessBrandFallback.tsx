import React from 'react';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'BL';
}

export function BusinessBrandFallback({ name, variant = 'logo', className = '' }: {
  name: string;
  variant?: 'logo' | 'cover';
  className?: string;
}) {
  if (variant === 'cover') {
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center bg-white px-5 text-center ${className}`}>
        <span className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-gold-600">Perennial Link business</span>
        <span className="max-w-full break-words text-xl font-black tracking-tight text-navy sm:text-2xl">{name}</span>
        <span className="mt-2 h-px w-12 bg-gold-400" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-navy to-sea text-center font-black text-white shadow-md ring-4 ring-white ${className}`} aria-label={`${name} logo`}>
      {initials(name)}
    </div>
  );
}
