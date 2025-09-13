'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// This is a new component we're creating.
// Its only job is to wrap our application in the SessionProvider.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}