import AppContext from '@/store/AppContext';
import { useContext } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router';
import PremiumHighlighter from '@/components/custom/PremiumHighlighter';
import usePurchasedPlans from '../hooks/usePurchasedPlans';
import useOrgHelper from '../../OrgSetup/hooks/useOrgHelper';

const UpgradeToPro = () => {
  const { featureFlags } = useContext(AppContext);
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const { isActiveOrgFreePlan, isUserFreePlan } = usePurchasedPlans();
  const { isActiveOrgCreatedByMe } = useOrgHelper();

  if (featureFlags.ff_enable_paid_subscription === false) {
    return null;
  }

  const onBtnClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // navigate('/infrastructure/manage-subscription');
    navigate('/plans');
  };

  if (isUserFreePlan() && (!featureFlags.ff_enable_teams || (isActiveOrgFreePlan() && isActiveOrgCreatedByMe()))) {
    return (
      <button onClick={onBtnClick}>
        <PremiumHighlighter>{'Upgrade to premium'}</PremiumHighlighter>
      </button>
    );
  }

  // return (
  //   <Button variant="linkNoUnderline" size="sm" className="bg-primary/20 hover:bg-primary/10" onClick={onBtnClick}>
  //     <Sparkles /> {plan?.title} Plan
  //   </Button>
  // );
  return null;
};

export default UpgradeToPro;
