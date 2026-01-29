import DialogWrapper from '@/components/custom/DialogWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showErrorToast } from '@/lib/toast-helper';
import type { ICreateOrderResponse } from '@/lib/types';
import AppContext from '@/store/AppContext';
import { useContext, useState, useMemo, useTransition } from 'react';
import { invokeRazorPay } from '../utils/subscription-utils';
import { useRazorpay } from 'react-razorpay';
import { PaymentSuccessDialog } from '@/components/billingsdk/payment-success-dialog';
import { useNavigate } from 'react-router';
import usePurchasedPlans from '../hooks/usePurchasedPlans';

interface AddMoreUsersDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  purchasePlanId: number;
}

const AddMoreUsersDialog = ({ isOpen, setIsOpen, purchasePlanId }: AddMoreUsersDialogProps) => {
  const { purchasePlans, subscriptionConfig, loggedInUser } = useContext(AppContext);
  const { plans, CURRENCY_SYMBOL, CURRENCY } = subscriptionConfig;
  const [numberOfUsers, setNumberOfUsers] = useState<number>(1);
  const [isTransitionGoingOn, startTransition] = useTransition();
  const { Razorpay } = useRazorpay();
  const { loadPurchasedPlans } = usePurchasedPlans();
  const navigate = useNavigate();
  const [paymentSuccessDialogOpen, setPaymentSuccessDialogOpen] = useState(false);

  // Find the purchased plan details
  const purchasedPlan = useMemo(() => purchasePlans.find((plan) => plan.purchased_id === purchasePlanId), [purchasePlans, purchasePlanId]);

  // Find the plan configuration
  const planConfig = useMemo(() => plans.find((p) => p.id === purchasedPlan?.plan_id), [plans, purchasedPlan]);

  // Calculate the amount based on number of users
  const calculatedAmount = useMemo(() => {
    if (!purchasedPlan || !planConfig) return 0;

    // Determine if it's monthly or yearly based on for_months
    const isYearly = purchasedPlan.for_months === 12;
    const pricePerUser = isYearly ? parseFloat(planConfig.yearlyPrice) : parseFloat(planConfig.monthlyPrice);

    return pricePerUser * numberOfUsers;
  }, [purchasedPlan, planConfig, numberOfUsers]);

  const handleAddUsers = () => {
    setIsOpen(false);

    startTransition(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const createdOrderResponse: ICreateOrderResponse = await getAxiosInstance().post('payment-gateway/add-more-users-order', {
          purchased_id: purchasePlanId,
          currency: CURRENCY,
          for_no_users: numberOfUsers,
        });

        await invokeRazorPay(
          calculatedAmount,
          CURRENCY,
          createdOrderResponse,
          {
            name: `${loggedInUser.fname} ${loggedInUser.lname}`,
            email: loggedInUser.email,
            contact: loggedInUser.mobNo?.toString() || '',
          },
          Razorpay,
        );

        setIsOpen(true);
        setPaymentSuccessDialogOpen(true);
      } catch (e) {
        setIsOpen(true);

        showErrorToast({
          header: 'Failed to add users.',
          description: 'Please try again later or contact support if the issue persists.',
        });
      } finally {
        loadPurchasedPlans();
      }
    });
  };

  const handleCancel = () => {
    setNumberOfUsers(1);
    setIsOpen(false);
  };

  if (!purchasedPlan || !planConfig) {
    showErrorToast({
      header: 'Failed to load plan details.',
      description: 'Please try again later or contact support if the issue persists.',
    });
    return null;
  }

  return (
    <DialogWrapper
      open={isOpen}
      setIsOpen={setIsOpen}
      disableOutsideClick
      header={`Add More Users in ${planConfig.title}`}
      actionsJSX={
        <>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAddUsers} disabled={numberOfUsers < 1} loading={isTransitionGoingOn}>
            Make Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4 pt-4">
        {/* Sub-header with Order ID */}
        <div className="text-sm text-muted-foreground">
          <p>
            <span className="font-medium">Order ID:</span> {purchasedPlan.z_order_id}
          </p>
          <p>
            <span className="font-medium">Current Users:</span> {purchasedPlan.for_no_users}
          </p>
          <p>
            <span className="font-medium">Plan Duration:</span> {purchasedPlan.for_months === 12 ? 'Yearly' : 'Monthly'}
          </p>
        </div>

        {/* Input field for number of users */}
        <div className="space-y-2">
          <Label htmlFor="numberOfUsers">Number of Users to Add</Label>
          <Input
            id="numberOfUsers"
            type="number"
            min="1"
            value={numberOfUsers}
            onChange={(e) => setNumberOfUsers(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="Enter number of users"
          />
        </div>

        {/* Amount calculation display */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Price per user:</span>
            <span className="text-sm">
              {CURRENCY_SYMBOL}
              {purchasedPlan.for_months === 12 ? planConfig.yearlyPrice : planConfig.monthlyPrice}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Number of users:</span>
            <span className="text-sm">{numberOfUsers}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                {CURRENCY_SYMBOL}
                {calculatedAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <PaymentSuccessDialog
        open={paymentSuccessDialogOpen}
        onOpenChange={(isOpen) => {
          setPaymentSuccessDialogOpen(isOpen);

          if (!isOpen) {
            navigate('/infrastructure/payment-history');
          }
        }}
        price={calculatedAmount.toFixed(2)}
        currencySymbol={CURRENCY_SYMBOL}
        productName={planConfig.title}
        proceedButtonText="Go to Dashboard"
        backButtonText="Go to Payment History"
        onProceed={() => navigate('/')}
        onBack={() => navigate('/infrastructure/payment-history')}
      />
    </DialogWrapper>
  );
};

export default AddMoreUsersDialog;
