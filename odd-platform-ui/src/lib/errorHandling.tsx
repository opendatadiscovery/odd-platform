import React from 'react';
import toast, { type ToastType } from 'react-hot-toast';
import AppToast from '../components/shared/elements/AppToast/AppToast';

export interface AppError {
  status: number;
  statusText: string;
  url: string;
  message: string;
}

// The generated API client throws ResponseError wrapping the Response (runtime.ts), so the
// real status/statusText/body live one level deeper than a bare fetch Response.
const toResponse = (err: unknown): Response | undefined => {
  if (err instanceof Response) return err;
  const wrapped = (err as { response?: unknown })?.response;
  return wrapped instanceof Response ? wrapped : undefined;
};

export const getErrorResponse = async (err: Response | unknown): Promise<AppError> => {
  const response = toResponse(err);

  let body: Record<string, string> = {};
  try {
    if (response) body = await response.clone().json();
  } catch {
    // do nothing
  }

  return {
    status: response?.status as number,
    statusText: response?.statusText as string,
    url: response?.url as string,
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
  err: Response | unknown,
  options?: ErrorToastOptions
) => {
  const response = toResponse(err);

  let body: Record<string, string> = {};
  try {
    if (response) body = await response.clone().json();
  } catch {
    // do nothing
  }

  let message = body?.message || 'An error occurred';

  if (options?.additionalMessage) {
    message = `${body?.message} ${options.additionalMessage}`;
  }

  if (response?.status) {
    showToast('error', { id: response.url, message });
  }
};
