import { Alert as GeneratedAlert } from 'generated-sources';

export interface Alert extends Omit<GeneratedAlert, 'createdAt' | 'statusUpdatedAt'> {
  createdAt: number;
  statusUpdatedAt: number;
}
