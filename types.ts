import React from 'react';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface Skill {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}