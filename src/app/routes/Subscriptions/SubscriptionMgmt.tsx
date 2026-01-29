import { getDisplayPaymentMethod, isFreePlan } from './utils/subscription-utils';
import { useNavigate } from 'react-router';
import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import { SubscriptionManagement } from '@/components/billingsdk/subscription-management';
import { useContext, useMemo, useState } from 'react';
import AppContext from '@/store/AppContext';
import { formatISODateWithTime24H } from '@/lib/utils';
import { CreditCard, GalleryVerticalEnd, History } from 'lucide-react';
import UpcomingPlans from './components/UpcomingPlans';
import AddMoreUsersDialog from './components/AddMoreUsersDialog';

const SubscriptionMgmt = () => {
  const navigate = useNavigate();
  const { activePlan, purchasePlans, subscriptionConfig } = useContext(AppContext);
  const { plans, CURRENCY_SYMBOL } = subscriptionConfig;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activePurchasedPlan = plans.find((p) => p.id === activePlan?.plan_id) || plans[0];

  const upcomingPlans = useMemo(
    () => purchasePlans.filter((purchasePlan) => purchasePlan.status === 'paid' && new Date(purchasePlan.startAt) > new Date()).reverse(),
    [purchasePlans],
  );
  const historyPlans = useMemo(
    () => purchasePlans.filter((purchasePlan) => purchasePlan.status === 'paid' && new Date(purchasePlan.endAt) < new Date()),
    [purchasePlans],
  );

  const freePlan = !activePlan || isFreePlan(activePlan);

  return (
    <FlexColsLayout>
      <div className="pb-5 sm:pl-20 px-2 w-200 mx-auto">
        {!freePlan ? (
          <>
            <SubscriptionManagement
              currentPlan={{
                plan: activePurchasedPlan,
                type: activePlan.for_months === 12 ? 'yearly' : 'monthly',
                startDate: formatISODateWithTime24H(activePlan.startAt),
                expiryDate: formatISODateWithTime24H(activePlan.endAt),
                paymentMethod: getDisplayPaymentMethod(activePlan.z_payment_method),
                activePlanFor: activePlan.for_no_users,
                paidAmount: `${CURRENCY_SYMBOL}${activePlan.amount}`,
                status: 'active',
                transactionId: (() => {
                  const orderIds = [activePlan.z_order_id];

                  if (activePlan.updatedRecords)
                    activePlan.updatedRecords.forEach((record) => {
                      if (record.status !== 'paid') return;
                      orderIds.push(record.z_order_id);
                    });

                  return orderIds.join(', ');
                })(),
              }}
              canShowCancelPlanBtn={false}
              cancelSubscription={{
                title: 'Cancel Subscription',
                description: 'Are you sure you want to cancel your subscription?',
                plan: activePurchasedPlan,
                onCancel: (planId) => console.log('Subscription cancelled for plan:', planId),
                onKeepSubscription: (planId) => console.log('Subscription kept for plan:', planId),
              }}
              addMoreBtnProps={{
                text: 'Add more users to your plan',
                buttonProps: {
                  // onClick: () => navigate('/infrastructure/checkout?purchasePlanId=' + activePlan.purchased_id),
                  onClick: () => setIsDialogOpen(true),
                },
                canShow: activePlan.for_no_users < activePurchasedPlan.maxUserRequired,
              }}
              canShowUpdatePlanBtn={false}
              updatePlan={{
                currentPlan: activePurchasedPlan,
                plans: plans,
                triggerText: 'Change Plan',
                onPlanChange: (planId, isYearly) => {
                  navigate(`/infrastructure/checkout?plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`);
                },
              }}
            />
            <AddMoreUsersDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} purchasePlanId={activePlan.purchased_id} />
          </>
        ) : (
          <UpcomingPlans upcomingPlans={[activePlan]} Icon={CreditCard} title="Current Subscription" badgeText="Active" isFreePlan />
        )}

        <UpcomingPlans upcomingPlans={upcomingPlans} Icon={GalleryVerticalEnd} title="Upcoming Plans" badgeText="Upcoming" />
        <UpcomingPlans upcomingPlans={historyPlans} Icon={History} title="Expired Plans" badgeText="Expired" />
      </div>
    </FlexColsLayout>
  );
};

export default SubscriptionMgmt;
