import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import SelectListWrapper from '@/components/custom/SelectListWrapper';
import { TypographyHeading } from '@/components/custom/Typography/TypographyHeading';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import useCountries from '@/hooks/useCountries';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, ArrowRight } from 'lucide-react';
import LinkWrapper from '@/components/custom/LinkWrapper';
import { useContext, useRef, useState } from 'react';
import { useRazorpay } from 'react-razorpay';
import { getAxiosInstance } from '@/lib/axios-utils';
import AppContext from '@/store/AppContext';
import { showErrorToast } from '@/lib/toast-helper';
import { PaymentSuccessDialog } from '@/components/billingsdk/payment-success-dialog';
import type { ICreateOrderResponse } from '@/lib/types';
import { isEmailValid } from '@/lib/utils';
import usePurchasedPlans from '@/app/routes/Subscriptions/hooks/usePurchasedPlans';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { invokeRazorPay, isFreePlan } from './utils/subscription-utils';

const Checkout = () => {
  const { Razorpay } = useRazorpay();
  const { loggedInUser, subscriptionConfig, activePlan } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get('plan');
  const selectedBilling = searchParams.get('billing') || 'yearly';

  const countries = useCountries();

  const navigate = useNavigate();
  const [paymentSuccessDialogOpen, setPaymentSuccessDialogOpen] = useState(false);
  const [isPaymentLoading, setPaymentLoading] = useState(false);

  const { plans, CURRENCY, CURRENCY_SYMBOL } = subscriptionConfig;

  const selectedPlanRecord = plans.find((rec) => rec.id === selectedPlanId) || plans[0];
  const { minUserRequired, maxUserRequired } = selectedPlanRecord;

  const [billingPeriod, setBillingPeriod] = useState(selectedBilling);
  const [teamSize, setTimeSize] = useState(minUserRequired);

  //Total Calculation...
  const teamSizeForCalculation = teamSize <= minUserRequired ? minUserRequired : teamSize;

  const planAmount = billingPeriod === 'yearly' ? selectedPlanRecord.yearlyPrice : selectedPlanRecord.monthlyPrice;
  const totalFinalPrice = teamSizeForCalculation * parseFloat(planAmount);

  const largeAmountMonths = billingPeriod === 'yearly' ? 12 : 1;
  const monthlyPlanAmount = selectedPlanRecord.monthlyPrice;
  const subTotal = largeAmountMonths * teamSizeForCalculation * parseFloat(monthlyPlanAmount);

  const billingDetails = useRef({
    fullName: loggedInUser?.fname + ' ' + loggedInUser?.lname,
    country: '',
    address: '',
    email: loggedInUser?.email,
    mobileNo: loggedInUser?.mobNo?.toString(),
  });

  const { loadPurchasedPlans } = usePurchasedPlans();

  if (selectedPlanRecord.monthlyPrice === '0' || selectedPlanRecord.yearlyPrice === '0') {
    return <Navigate to="/" />;
  }

  const handleOnPayNow = async () => {
    const validateBillingDetails = () => {
      const errors: { [key: string]: string } = {};
      const details = billingDetails.current;

      if (!details.fullName.trim()) {
        errors.fullName = 'Full Name is required.';
      }

      if (!details.country.trim()) {
        errors.country = 'Country is required.';
      }

      if (!details.address.trim()) {
        errors.address = 'Address is required.';
      } else if (details.address.trim().length < 5) {
        errors.address = 'Address must be at least 5 characters.';
      }

      if (!details.email.trim()) {
        errors.email = 'Email is required.';
      } else if (!isEmailValid(details.email)) {
        errors.email = 'Email is invalid.';
      }

      if (!details.mobileNo?.toString().trim()) {
        errors.mobileNo = 'Mobile Number is required.';
      } else if (
        !/^\d+$/.test(details.mobileNo?.toString()) ||
        details.mobileNo?.toString().trim().length < 10 ||
        details.mobileNo?.toString().trim().length > 15
      ) {
        errors.mobileNo = 'Mobile Number is invalid (must be 10-15 digits).';
      }

      return errors;
    };

    const validationErrors = validateBillingDetails();
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors)
        .reverse()
        .forEach((errorMsg) =>
          showErrorToast({
            header: 'Invalid Billing Details',
            description: errorMsg,
          }),
        );
      return;
    }

    try {
      setPaymentLoading(true);

      const createdOrderResponse: ICreateOrderResponse = await getAxiosInstance().post('payment-gateway/create-order', {
        planId: selectedPlanRecord.id,
        // amount: totalFinalPrice,
        currency: CURRENCY,
        // for_months: billingPeriod === 'yearly' ? 12 : 1,
        billingPeriod: billingPeriod || 'yearly',
        for_no_users: teamSizeForCalculation,

        billing_name: billingDetails.current.fullName,
        billing_email: billingDetails.current.email,
        billing_contact_no: billingDetails.current.mobileNo,
        billing_address: billingDetails.current.address,
        billing_country: billingDetails.current.country,
      });

      const billerInfo = billingDetails.current;

      await invokeRazorPay(
        totalFinalPrice,
        CURRENCY,
        createdOrderResponse,
        {
          name: billerInfo.fullName || `${loggedInUser.fname} ${loggedInUser.lname}`,
          email: billerInfo.email || loggedInUser.email,
          contact: billerInfo.mobileNo?.toString() || loggedInUser.mobNo?.toString() || '',
        },
        Razorpay,
      );

      setPaymentSuccessDialogOpen(true);
    } catch (e: unknown) {
      showErrorToast({
        header: 'Payment Failed!',
        description: (e as Error)?.message,
      });
    } finally {
      await loadPurchasedPlans();
      setPaymentLoading(false);
    }
  };

  const getAlert = () => {
    if (isFreePlan(activePlan)) return null;

    return (
      <Alert variant="default" className="mb-5">
        <AlertCircleIcon />
        <AlertTitle>You currently have an active paid plan.</AlertTitle>
        <AlertDescription>
          <p>
            Please be aware that this purchase is for an upcoming plan. Check your{' '}
            <LinkWrapper className="text-primary" to={'/infrastructure/manage-subscription'}>
              current subscription
            </LinkWrapper>
            .
          </p>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <FlexColsLayout className="pb-5" responsive>
      <div className="sm:mx-auto mx-1 px-5">
        <TypographyHeading className="mb-4">
          Checkout "{selectedPlanRecord.title}" Plan{' '}
          <LinkWrapper className={'text-xs text-primary'} to={'/plans'}>
            Change Plan
          </LinkWrapper>
        </TypographyHeading>
        {getAlert()}
        <FlexColsLayout layout="horizontal" className="gap-5" responsive>
          <FlexColsLayout layout="vertical" className="sm:w-150 w-full gap-5" doNotAppendFlex1 responsive>
            <Card>
              <CardHeader>
                <CardTitle>Specify billing period and team size</CardTitle>
                <CardDescription>With yearly plans, you can save up to 17%.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label>Billing period *</Label>
                    <SelectListWrapper
                      triggerClassName="w-full"
                      placeholder="Select billing period"
                      items={[
                        { value: 'monthly', label: `Monthly - ${selectedPlanRecord.planDisplayCost?.monthly}` },
                        { value: 'yearly', label: `Yearly - ${selectedPlanRecord.planDisplayCost?.yearly}` },
                      ]}
                      value={billingPeriod}
                      onValueChange={(value) => setBillingPeriod(value)}
                    />
                  </div>
                  {minUserRequired > 1 ? (
                    <div className="grid gap-2">
                      <Label htmlFor="teamSize">
                        Team Size (This should be {minUserRequired} or &gt; {minUserRequired}) *
                      </Label>
                      <Input
                        type="number"
                        id="teamSize"
                        placeholder=""
                        min={minUserRequired}
                        max={maxUserRequired}
                        value={teamSize}
                        onChange={(e) => setTimeSize(Math.max(minUserRequired, parseInt(e.target.value) || minUserRequired))}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Details</CardTitle>
                <CardDescription>To finalize your subscription, kindly complete your details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      onChange={(e) => (billingDetails.current.fullName = e.currentTarget.value)}
                      id="fullName"
                      type="text"
                      placeholder=""
                      name="fullName"
                      defaultValue={loggedInUser?.fname + ' ' + loggedInUser?.lname}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="country">Country *</Label>
                    <SelectListWrapper
                      valueField="countryCode"
                      labelField="countryName"
                      triggerClassName="w-full"
                      placeholder=""
                      items={countries as unknown as Record<string, unknown>[]}
                      // value={selectedBilling || undefined}
                      onValueChange={(value) => {
                        billingDetails.current.country = value;
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea onChange={(e) => (billingDetails.current.address = e.target.value)} id="address" placeholder="" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      defaultValue={loggedInUser?.email}
                      onChange={(e) => (billingDetails.current.email = e.target.value)}
                      id="email"
                      type="email"
                      placeholder=""
                      name="email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mobileNo">Mobile No *</Label>
                    <Input
                      onChange={(e) => (billingDetails.current.mobileNo = e.target.value)}
                      id="mobileNo"
                      type="number"
                      placeholder=""
                      name="mobileNo"
                      defaultValue={loggedInUser?.mobNo}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FlexColsLayout>
          <FlexColsLayout layout="vertical" className="sm:w-80 w-full" doNotAppendFlex1 responsive>
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                      {CURRENCY_SYMBOL}
                      {subTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* {billingPeriod === 'yearly' ? ( */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount (Yearly)</span>
                    <span className="tabular-nums">
                      - {CURRENCY_SYMBOL}
                      {(subTotal - totalFinalPrice).toFixed(2)}
                    </span>
                  </div>
                  {/* ) : (
                    <></>
                  )} */}

                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                  </div> */}

                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-semibold tabular-nums">
                      {CURRENCY_SYMBOL}
                      {totalFinalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button className="mt-5" onClick={handleOnPayNow} loading={isPaymentLoading}>
              Make Payment <ArrowRight />
            </Button>
          </FlexColsLayout>
        </FlexColsLayout>
      </div>

      <PaymentSuccessDialog
        open={paymentSuccessDialogOpen}
        onOpenChange={(isOpen) => {
          setPaymentSuccessDialogOpen(isOpen);

          if (!isOpen) {
            navigate('/infrastructure/payment-history');
          }
        }}
        price={totalFinalPrice.toFixed(2)}
        currencySymbol={CURRENCY_SYMBOL}
        productName={selectedPlanRecord.title}
        proceedButtonText="Go to Dashboard"
        backButtonText="Go to Payment History"
        onProceed={() => navigate('/')}
        onBack={() => navigate('/infrastructure/payment-history')}
      />
    </FlexColsLayout>
  );
};

export default Checkout;
