'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '.';
import { FirebaseProvider, FirebaseServices } from './provider';
import { Skeleton } from '@/components/ui/skeleton';

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const firebaseServices = initializeFirebase();
    setServices(firebaseServices);
  }, []);

  useEffect(() => {
    if (!services?.auth) {
      if (services) {
        setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(
      services.auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [services]);

  if (!services || userAuthState.isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-1 items-center justify-end space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
            </div>
        </div>
        </header>
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-96 w-full" />
        </div>
        </main>
    </div>
    );
  }

  return (
    <FirebaseProvider services={services} userAuthState={userAuthState}>
      {children}
    </FirebaseProvider>
  );
}
