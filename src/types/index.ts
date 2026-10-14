import { Timestamp } from 'firebase/firestore';

export type Service = {
  id: string; // Firestore document ID
  name: string;
  description: string;
  longDescription: string;
  category: string;
  techStack: string[];
  imageUrl: string;
  imageHint: string;
  url: string;
  projectConfigId?: string;
};

export type Inquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  details: string;
  type: 'development' | 'investment';
  createdAt: Timestamp;
};

export type ProjectConfig = {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  createdAt?: any;
  updatedAt?: any;
};
