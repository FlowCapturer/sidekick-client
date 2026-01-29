import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getFlatNavigationItems, navigationItems } from './nav-menu';
import type { EmailProcessingResult, NavItem } from './types';
import { appInfo } from '../config/app-config';
import type { AlertDialogOptionsProps } from '@/components/custom/AlertDialog';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFormDataByFormEl = (formEl: HTMLFormElement) => {
  const formData = new FormData(formEl);
  return Object.fromEntries(formData.entries());
};

const processKey = (key: string) => `${appInfo.appId}_${key}`;

export const setLocalStorage = (key: string, value: string) => {
  localStorage.setItem(processKey(key), value);
};

export const getLocalStorage = (key: string) => {
  return localStorage.getItem(processKey(key));
};

export const isSameNavItem = (activeUrl: string, urlPath: string) => {
  if (!activeUrl) return false;
  if (urlPath === activeUrl) return true;

  const found = navigationItems.virtualChildOf.find((vc) => {
    return vc.id === activeUrl && vc.parentId === urlPath;
  });

  return !!found;
};

export const findNavMenu = <K extends keyof NavItem>(moduleName: NavItem[K]): NavItem | undefined => {
  const flatNavMap = getFlatNavigationItems();

  const navItem = flatNavMap.find((el) => el['url'] === moduleName);
  if (navItem) return navItem;

  //checking in virtualChildOf
  const virtualChild = navigationItems.virtualChildOf.find((vc) => vc.id === moduleName);
  if (virtualChild) {
    return flatNavMap.find((el) => el.url === virtualChild.parentId);
  }

  return undefined;
};

export const createIndexedArray = (n: number) => {
  return Array.from({ length: n }, (_v, i) => i);
};

export const defaultAlertConfig: AlertDialogOptionsProps = {
  open: false,
  type: 'CONFIRM',
  text: '',
};

export const validatePassword = (password: string) => {
  // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long.',
    };
  }
  if (!hasUpperCase) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter.',
    };
  }
  if (!hasLowerCase) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter.',
    };
  }
  if (!hasNumber) {
    return {
      valid: false,
      message: 'Password must contain at least one number.',
    };
  }
  if (!hasSpecialChar) {
    return {
      valid: false,
      message: 'Password must contain at least one special character.',
    };
  }

  return { valid: true, message: 'Password is valid.' };
};

export const errorLogger = (error: unknown) => {
  console.error(error);
};

/**
 * Check weather the email is valid or not.
 *
 * @param email - An email id
 * @returns Boolean
 */
export const isEmailValid = (email: string) => {
  if (!email) {
    return false;
  }

  const arrayEmail = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
  return Array.isArray(arrayEmail) && arrayEmail.length > 0;
};

export const processEmailsWithValidation = (textareaValue: string): EmailProcessingResult => {
  if (!textareaValue || typeof textareaValue !== 'string') {
    return {
      validEmails: [],
      invalidEmails: [],
      totalProcessed: 0,
    };
  }

  // Remove newline characters and split by comma
  const emailList = textareaValue
    .replace(/\n/g, '') // Remove all newline characters
    .split(',') // Split by comma
    .map((email) => email.trim()) // Remove whitespace from each email
    .filter((email) => email.length > 0); // Remove empty strings

  const validEmails: string[] = [];
  const invalidEmails: string[] = [];

  emailList.forEach((email) => {
    if (isEmailValid(email)) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
    }
  });

  return {
    validEmails,
    invalidEmails,
    totalProcessed: emailList.length,
  };
};

export const waitTill = (millSecs: number = 3000) => {
  return new Promise((resolve) => setTimeout(resolve, millSecs));
};

export const convertServerDateToJS = (serverDateStr: string) => new Date(serverDateStr);

export const formatISODateWithTime24H = (isoString: string | Date, use12hr: boolean = true) => {
  if (!isoString) return '';

  const date = isoString instanceof Date ? isoString : convertServerDateToJS(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  let ampm = '';
  if (use12hr) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert to 12-hour format
  }

  const hoursStr = String(hours).padStart(2, '0');

  return use12hr ? `${day}/${month}/${year}, ${hoursStr}:${minutes} ${ampm}` : `${day}/${month}/${year}, ${hoursStr}:${minutes}`;
};

export const formatElapsedTime = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInMs < 5 * 60 * 1000) {
    return 'Just now'; //less than 5 minutes
  } else if (diffInHours < 1) {
    return `${Math.floor(diffInMs / (1000 * 60))} minutes ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

const MULTIPLIER = 729444;
export const generatePublicId = (privateId: number) => privateId * MULTIPLIER;
export const undoPublicId = (publicId: number) => Math.floor(publicId / MULTIPLIER);

export const mapIncrementBy2 = <T, R>(arr: T[], callback: (firstEl: T, secondEl: T | undefined, i: number) => R): R[] => {
  const result: R[] = [];
  for (let i = 0; i < arr.length; i += 2) {
    const firstEl = arr[i];
    const secondEl = arr[i + 1];
    result.push(callback(firstEl, secondEl, i));
  }
  return result;
};

export const generateRandom4Digits = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const isFunction = (value: unknown) => {
  return typeof value === 'function';
};

export const isTruthyValue = (value: 1 | '1' | boolean | 0 | '0') => value === 1 || value === '1' || value === true;

export const INVITATION_ENUMS = Object.freeze({
  NOT_SAVED: 10,
  INVITED: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  LEFT: 3,
  text: {
    10: 'Not Saved',
    0: 'Invited',
    1: 'Active (Accepted)',
    2: 'Rejected',
    3: 'Left',
  },
  getDisplay(statusCode: number) {
    return this.text[statusCode as keyof typeof this.text] as string;
  },
});

export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return obj && Object.keys(obj).length === 0;
};

export const isValidId = (id: string | number) => {
  const intId = parseInt(id as string, 10);
  return intId > 0;
};

export const getModuleNameFromUrl = (pathName: string) => {
  const moduleName = pathName.split('/')[2];
  return moduleName;
};

export function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
