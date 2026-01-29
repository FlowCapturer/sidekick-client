import type { CurrencyCode } from 'react-razorpay/dist/constants/currency';
import type { purchasedPlansInf } from './types';

export interface Plan {
  id: string;
  title: string;
  description: string;
  highlight?: boolean;
  type?: 'monthly' | 'yearly';
  currency?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  badge?: string;
  planDisplayCost?: {
    monthly: string;
    yearly: string;
  };
  minUserRequired: number;
  maxUserRequired: number;
  features: {
    name: string;
    icon: string;
    iconColor?: string;
  }[];
}

export interface CurrentPlan {
  plan: Plan;
  type: 'monthly' | 'yearly' | 'custom';
  price?: string;
  startDate: string;
  expiryDate: string;
  activePlanFor: number;
  paidAmount: string;
  transactionId?: string;
  paymentMethod: string;
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
}

export interface ISubscriptionConfig {
  plans: Plan[];
  freePurchasedPlan: purchasedPlansInf;
  CURRENCY_SYMBOL: string;
  CURRENCY: CurrencyCode;
  faqs: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}
