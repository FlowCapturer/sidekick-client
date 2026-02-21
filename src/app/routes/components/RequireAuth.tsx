import FullPageLoading from '@/components/custom/FullPageLoading';
import usePurchasedPlans from '@/app/routes/Subscriptions/hooks/usePurchasedPlans';
import { getAxiosInstance } from '@/lib/axios-utils';
import type { IFeatureFlagsResponse, OrganizationTypeResponse, SessionInfoResponse } from '@/lib/types';
import { getLocalStorage } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { useState, useEffect, useContext, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { ISubscriptionConfig } from '@/lib/billingsdk-config';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { orgs, setOrgs, loggedInUser, setLoggedInUser, setActiveOrg, subscriptionConfig, setSubscriptionConfig, featureFlags, setFeatureFlags } =
    useContext(AppContext);
  const { loadPurchasedPlans } = usePurchasedPlans();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featuresFlg = (await getAxiosInstance().get('/feature-flags')) as IFeatureFlagsResponse;
        setFeatureFlags(featuresFlg.featureFlags);

        const sessionResponse = (await getAxiosInstance().get('/check-session')) as SessionInfoResponse;
        const isAuthed = !!sessionResponse.sessionInfo?.id;

        setLoggedInUser({
          email: sessionResponse.user.user_email,
          id: sessionResponse.sessionInfo?.id,
          fname: sessionResponse.user.user_fname,
          lname: sessionResponse.user.user_lname,
          mobNo: String(sessionResponse.user.user_mobile_no),
        });

        if (isAuthed === true) {
          if (featuresFlg.featureFlags.ff_enable_paid_subscription) {
            await loadPurchasedPlans(true);
          }

          if (featuresFlg.featureFlags.ff_enable_teams) {
            const orgsRes = (await getAxiosInstance().get('organization')) as OrganizationTypeResponse;
            const fetchedOrgs = orgsRes?.orgs || [];
            setOrgs(fetchedOrgs);

            const activeOrgId = getLocalStorage('activeOrgId');
            let lastSelectedOrg = fetchedOrgs[0];
            if (activeOrgId) {
              lastSelectedOrg = fetchedOrgs.find((org) => String(org.org_id) === activeOrgId) || lastSelectedOrg;
            }
            setActiveOrg(lastSelectedOrg);
          }
        }

        if (featuresFlg.featureFlags.ff_enable_paid_subscription && 'plans' in subscriptionConfig === false) {
          const subscriptionConfigResponse = (await getAxiosInstance().get('/get-subscription-config')) as ISubscriptionConfig;
          setSubscriptionConfig(subscriptionConfigResponse);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!loggedInUser?.id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (featureFlags.ff_enable_teams && orgs.length === 0 && !location.pathname.includes('infrastructure')) {
    return (
      <Navigate
        to={featureFlags.ff_enable_paid_subscription ? '/infrastructure/manage-subscription' : '/infrastructure'}
        state={{ from: location }}
        replace
      />
    );
  }

  // if (orgs.length === 0 && !location.pathname.includes('/infrastructure/manage-subscription')) {
  //   return <Navigate to="/infrastructure/manage-subscription" state={{ from: location }} replace />;
  // }

  return children;
};

export default RequireAuth;
