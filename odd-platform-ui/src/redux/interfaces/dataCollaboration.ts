import { Message as GeneratedMessage } from 'generated-sources';

export interface Message extends Omit<GeneratedMessage, 'createdAt'> {
  createdAt: number;
}
