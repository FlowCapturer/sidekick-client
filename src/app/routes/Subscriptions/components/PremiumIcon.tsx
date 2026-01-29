// import PremiumHighlighter from '@/components/custom/PremiumHighlighter';
import { TooltipWrapper } from '@/components/custom/TooltipWrapper';
import { Badge } from '@/components/ui';
import { appInfo } from '@/config/app-config';
import type { purchasedPlansInf } from '@/lib/types';
import AppContext from '@/store/AppContext';
// import { SparkleIcon } from 'lucide-react';
import { useContext } from 'react';
import { isFreePlan } from '../utils/subscription-utils';

interface IPremiumIcon {
  purchasedPlan: purchasedPlansInf;
}

const PremiumIcon = ({ purchasedPlan }: IPremiumIcon) => {
  const { subscriptionConfig, featureFlags } = useContext(AppContext);

  if (!featureFlags.ff_enable_paid_subscription) return null;

  const plan = subscriptionConfig.plans.find((p) => p.id === purchasedPlan.plan_id);
  if (!plan) return null;

  const isFree = isFreePlan(purchasedPlan);

  return (
    <TooltipWrapper
      delayDuration={20}
      content={
        <>
          This {appInfo.account_type_txt.singular.toLocaleLowerCase()} is on a "{plan.title}" plan.
        </>
      }
      side="right"
    >
      <div>
        {/* <PremiumHighlighter /> */}
        {/* <SparkleIcon /> */}
        <Badge variant={'success'}>{isFree ? 'Free' : 'Premium'}</Badge>
      </div>
    </TooltipWrapper>
  );
};

export default PremiumIcon;
