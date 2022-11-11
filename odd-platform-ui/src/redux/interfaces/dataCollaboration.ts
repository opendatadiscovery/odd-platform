import type { Message as GeneratedMessage } from 'generated-sources';

export interface Message extends Omit<GeneratedMessage, 'createdAt'> {
  createdAt: number;
}

export interface MessagesByDate {
  [date: string]: Message[];
}
