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
      <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-navy via-sea to-sky-600 px-5 text-center text-white ${className}`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/15 text-xl font-black shadow-lg">{initials(name)}</span>
        <span className="mt-3 max-w-full break-words text-base font-bold tracking-tight sm:text-xl">{name}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-navy to-sea text-center font-black text-white shadow-md ring-4 ring-white ${className}`} aria-label={`${name} logo`}>
      {initials(name)}
    </div>
  );
}
