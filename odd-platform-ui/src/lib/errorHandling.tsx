import React from 'react';
import toast, { type ToastType } from 'react-hot-toast';
import AppToast from '../components/shared/elements/AppToast/AppToast';

export interface AppError {
  status: number;
  statusText: string;
  url: string;
  message: string;
}

export const getErrorResponse = async (response: Response): Promise<AppError> => {
  let body: Record<string, string> = {};
  try {
    body = await response.clone().json();
  } catch (e) {
    // do nothing;
  }

  return {
    status: response?.status,
    statusText: response?.statusText,
    url: response?.url,
    message: body?.message || 'An error occurred',
  };
};

interface ToastOptions {
  id?: string;
  message: string;
}

const showToast = (type: ToastType, { message, id }: ToastOptions) => {
  toast.custom(
    t => <AppToast type={type} message={message} onClose={() => toast.remove(t.id)} />,
    { id }
  );
};

export const showSuccessToast = (options: ToastOptions) => {
  showToast('success', options);
};

interface ErrorToastOptions {
  additionalMessage: string;
}

export const showServerErrorToast = async (
  response: Response,
  options?: ErrorToastOptions
) => {
  let body: Record<string, string> = {};
  try {
    body = await response.json();
  } catch (e) {
    // do nothing;
  }

  let message = body?.message || 'An error occurred';

  if (options?.additionalMessage) {
    message = `${body?.message} ${options.additionalMessage}`;
  }

  if (response.status) {
    showToast('error', { id: response.url, message });
  }
};
