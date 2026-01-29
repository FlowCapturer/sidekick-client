import type { JSX } from 'react';
import { toast } from 'sonner';

interface ToastParams {
  header?: string;
  description: string | JSX.Element;
}

export const showSuccessToast = ({ header = 'Success', description }: ToastParams) => {
  toast.success(header, {
    description,
    // style: { background: '#22c55e', color: 'white' },
  });
};

export const showErrorToast = ({ header = 'Error', description }: ToastParams) => {
  toast.error(header, {
    description,
    // style: { background: 'orangered', color: 'white' },
  });
};

export const showWarningToast = ({ header = 'Warning', description }: ToastParams) => {
  toast.warning(header, {
    description,
    // style: { background: '#f97316', color: 'white' },
  });
};
