import { useCallback, useContext } from 'react';
import { getAxiosInstance } from '@/lib/axios-utils';
import type { purchasedPlansInf, purchasedPlansInfResponse } from '@/lib/types';
import AppContext from '@/store/AppContext';
import { isFreePlan } from '../utils/subscription-utils';

const processPurchasedPlan = (plan: purchasedPlansInf): purchasedPlansInf => {
  if (plan.status !== 'paid') return plan;

  plan.startAt = new Date(plan.startAt);
  plan.endAt = new Date(plan.endAt);

  plan.old_purchased_amount = Number(plan.amount);
  plan.updatedRecords &&
    plan.updatedRecords.forEach((updatedRecord: any) => {
      plan.amount = Number(plan.amount) + Number(updatedRecord.amount);
    });

  return plan;
};

const usePurchasedPlans = () => {
  const { setPurchasePlans, setActivePlan, featureFlags, activePlan, activeOrg } = useContext(AppContext);

  const loadPurchasedPlans = useCallback(
    async (forceLoad: boolean = false) => {
      if (!forceLoad && !featureFlags.ff_enable_paid_subscription) return;

      const purchasedPlans = (await getAxiosInstance().get('/purchased-plans')) as purchasedPlansInfResponse;

      purchasedPlans.purchasedPlans.forEach(processPurchasedPlan);

      setPurchasePlans([...(purchasedPlans.purchasedPlans || [])].reverse());
      setActivePlan(processPurchasedPlan(purchasedPlans.activePlan));
    },
    [setPurchasePlans, setActivePlan, featureFlags.ff_enable_paid_subscription],
  );

  const isActiveOrgFreePlan = useCallback(() => {
    return isFreePlan(activeOrg?.active_purchased_plan);
  }, [activeOrg]);

  const isUserFreePlan = useCallback(() => {
    return isFreePlan(activePlan);
  }, [activePlan]);

  // const isActiveOrgCreatedByUser = useCallback(() => {
  //   return activeOrg?. === 'user';
  // }, [activeOrg]);

  return {
    loadPurchasedPlans,
    isActiveOrgFreePlan,
    isUserFreePlan,
  };
};

export default usePurchasedPlans;
