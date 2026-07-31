import React from 'react';

/** The app uses its own HTTP-only session cookie, not NextAuth. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
