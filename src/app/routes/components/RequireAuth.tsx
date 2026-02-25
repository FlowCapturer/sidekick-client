import FullPageLoading from '@/components/custom/FullPageLoading';
import usePurchasedPlans from '@/app/routes/Subscriptions/hooks/usePurchasedPlans';
import { getAxiosInstance } from '@/lib/axios-utils';
import type { IFeatureFlagsResponse, OrganizationTypeResponse, SessionInfoResponse } from '@/lib/types';
import { getLocalStorage } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { useEffect, useContext, type ReactNode, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { ISubscriptionConfig } from '@/lib/billingsdk-config';
import { useQuery } from '@tanstack/react-query';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation();
  const { orgs, setOrgs, loggedInUser, setLoggedInUser, setActiveOrg, setSubscriptionConfig, featureFlags, setFeatureFlags } = useContext(AppContext);
  const { loadPurchasedPlans } = usePurchasedPlans();
  const [isDataUpdatedInContext, setIsDataUpdatedInContext] = useState(false);

  const { data: featureFlagsData, isLoading: isLoadingFeatureFlags } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => getAxiosInstance().get('/feature-flags') as Promise<IFeatureFlagsResponse>,
  });

  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session'],
    queryFn: () => getAxiosInstance().get('/check-session') as Promise<SessionInfoResponse>,
  });

  const isAuthed = !!sessionData?.sessionInfo?.id;
  const ff = featureFlagsData?.featureFlags;

  const { data: orgsData, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getAxiosInstance().get('organization') as Promise<OrganizationTypeResponse>,
    enabled: isAuthed && !!ff?.ff_enable_teams,
  });

  const { data: subscriptionConfigData, isLoading: isLoadingSubConfig } = useQuery({
    queryKey: ['subscriptionConfig'],
    queryFn: () => getAxiosInstance().get('/get-subscription-config') as Promise<ISubscriptionConfig>,
    enabled: !!ff?.ff_enable_paid_subscription, // && !('plans' in subscriptionConfig)
  });

  const { isLoading: isLoadingPurchasedPlans } = useQuery({
    queryKey: ['purchasedPlans'],
    queryFn: async () => {
      await loadPurchasedPlans(true);
      return true;
    },
    enabled: isAuthed && !!ff?.ff_enable_paid_subscription,
  });

  useEffect(() => {
    if (featureFlagsData?.featureFlags) {
      setFeatureFlags(featureFlagsData.featureFlags);
    }
  }, [featureFlagsData, setFeatureFlags]);

  useEffect(() => {
    if (sessionData) {
      setLoggedInUser({
        email: sessionData.user.user_email,
        id: sessionData.sessionInfo?.id,
        fname: sessionData.user.user_fname,
        lname: sessionData.user.user_lname,
        mobNo: String(sessionData.user.user_mobile_no),
      });
    }
  }, [sessionData, setLoggedInUser]);

  useEffect(() => {
    if (orgsData) {
      const fetchedOrgs = orgsData.orgs;
      setOrgs(fetchedOrgs);

      const activeOrgId = getLocalStorage('activeOrgId');
      let lastSelectedOrg = fetchedOrgs[0];
      if (activeOrgId) {
        lastSelectedOrg = fetchedOrgs.find((org) => String(org.org_id) === activeOrgId) || lastSelectedOrg;
      }
      setActiveOrg(lastSelectedOrg);
    }
  }, [orgsData, setOrgs, setActiveOrg]);

  useEffect(() => {
    if (subscriptionConfigData) {
      setSubscriptionConfig(subscriptionConfigData);
    }
  }, [subscriptionConfigData, setSubscriptionConfig]);

  const loading = isLoadingFeatureFlags || isLoadingSession || isLoadingOrgs || isLoadingPurchasedPlans || isLoadingSubConfig;

  useEffect(() => {
    if (loading || !orgsData) {
      return;
    }

    const isSameOrgRef = orgsData.orgs === orgs;
    const isSameSessionRef = sessionData && sessionData?.sessionInfo?.id && loggedInUser.id === sessionData.sessionInfo.id;

    if (isSameOrgRef && isSameSessionRef) {
      setIsDataUpdatedInContext(true);
    }
  }, [loading, orgs, orgsData, sessionData, loggedInUser]);

  // ||
  // (isAuthed && ff?.ff_enable_teams && isLoadingOrgs) ||
  // (isAuthed && ff?.ff_enable_paid_subscription && isLoadingPurchasedPlans) ||
  // (ff?.ff_enable_paid_subscription && isLoadingSubConfig);

  if (loading || isDataUpdatedInContext !== true) {
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
