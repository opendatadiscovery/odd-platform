import React from 'react';
import toast, { type ToastType } from 'react-hot-toast';
import AppToast from '../components/shared/AppToast/AppToast';

export const getResponse = async (
  response: Response
): Promise<{
  status: number;
  statusText: string;
  url: string;
  message: string;
}> => {
  let body: Record<string, string> = {};
  try {
    body = await response.clone().json();
  } catch (e) {
    // do nothing;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    message: body?.message || 'An error occurred',
  };
};

interface ToastOptions {
  id: string;
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

export const showServerErrorToast = ({
  status,
  toastId,
  message,
}: {
  status: number;
  message: string | undefined;
  toastId: string;
}) => {
  if (status) {
    showToast('error', {
      id: toastId,
      message: message || 'An error occurred',
    });
  }
};
