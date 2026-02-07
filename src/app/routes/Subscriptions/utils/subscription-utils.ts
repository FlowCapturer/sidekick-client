import { appInfo } from '@/config/app-config';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showErrorToast } from '@/lib/toast-helper';
import type { ICreateOrderResponse, IRazorPayPrefill, IVerifyPaymentResponse, purchasedPlansInf } from '@/lib/types';
import type { CurrencyCode } from 'react-razorpay/dist/constants/currency';

export const getCurrencySymbol = (currency: string) => {
  if (currency === 'INR') return '₹';
  if (currency === 'USD') return '$';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  if (currency === 'AUD') return '$';
  if (currency === 'CAD') return '$';
  if (currency === 'CHF') return '₣';
  if (currency === 'CNY') return '¥';
  if (currency === 'DKK') return 'kr';
  if (currency === 'HKD') return '$';
  if (currency === 'NZD') return '$';
  if (currency === 'SEK') return 'kr';
  if (currency === 'SGD') return '$';
  if (currency === 'ZAR') return 'R';
  return '';
};

export const getDisplayPaymentMethod = (paymentMethod: string) => {
  if (paymentMethod === 'netbanking') return 'Net Banking';
  if (paymentMethod === 'wallet') return 'Wallet';
  if (paymentMethod === 'upi') return 'UPI';
  if (paymentMethod === 'card') return 'Card';
  return paymentMethod;
};

export const isFreePlan = (plan: purchasedPlansInf | undefined) => !plan || plan.plan_id === 'starter';

export const invokeRazorPay = (
  totalFinalPrice: number,
  CURRENCY: string,
  createdOrderResponse: ICreateOrderResponse,
  prefillObject: IRazorPayPrefill,
  Razorpay: any,
) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: appInfo.RAZOR_PAY_KEY,
      amount: totalFinalPrice * 100,
      currency: CURRENCY as CurrencyCode,
      order_id: createdOrderResponse.orderId,
      name: appInfo.appName,
      description: appInfo.appDescription,

      handler: async function (response: any) {
        // setPaymentLoading(true);

        try {
          const verifyRes: IVerifyPaymentResponse = await getAxiosInstance().post('payment-gateway/verify-payment', {
            orderId: createdOrderResponse.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (!verifyRes.success) return reject('Payment verification failed.');

          resolve(true);
        } catch (error: any) {
          showErrorToast({
            header: 'Payment failed!',
            description: error?.message || 'Payment verification failed.',
          });
          reject(error);
        }
      },

      prefill: prefillObject,
      theme: { color: appInfo.THEME_COLOR },
      modal: {
        ondismiss: function () {
          // User closed the payment dialog without completing payment
          reject(new Error('Payment cancelled!'));
        },
      },
    };

    const razorpay = new Razorpay(options);

    // Add error handling after razorpay.open()
    razorpay.on('payment.failed', function (response: any) {
      showErrorToast({
        header: 'Payment Failed!',
        description: response.error.description || 'Payment could not be processed.',
      });

      // Optional: Log the failure to your backend
      getAxiosInstance()
        .post('payment-gateway/log-failure', {
          orderId: createdOrderResponse.orderId,
          errorCode: response.error.code,
          errorDescription: response.error.description,
          errorReason: response.error.reason,
          paymentId: response.metadata?.payment_id,
        })
        .catch(() => {});
    });

    razorpay.open();
  });
};
