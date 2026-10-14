'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, getCountFromServer, Query } from 'firebase/firestore'
import { useEffect, useState } from 'react';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp?: FirebaseApp) {
  const app = firebaseApp || getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);


  if (process.env.NODE_ENV !== 'production') {
    // These are safe to call multiple times, a warning will be logged.
    // connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    // connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  }

  return {
    firebaseApp: app,
    auth,
    firestore
  };
}

/**
 * Hook to get the count of documents in a collection specified by a query.
 * @param {Query | null} query - The Firestore query to count documents for.
 * @returns {{ count: number; isLoading: boolean; error: Error | null }}
 */
export function useCollectionCount(query: Query | null) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    const getCount = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getCountFromServer(query);
        setCount(snapshot.data().count);
        setError(null);
      } catch (e: any) {
        console.error("useCollectionCount error:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    getCount();
  }, [query]);

  return { count, isLoading, error };
}


export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';