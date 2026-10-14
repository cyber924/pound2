"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { type ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster"

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </FirebaseClientProvider>
  );
}
