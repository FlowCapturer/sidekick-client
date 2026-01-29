import { Toaster } from '@/components/ui/sonner';
import Routes, { type IRoutes } from './app/Routes';
import AppContext from './store/AppContext';
import './App.css';
import useTheme from './hooks/useTheme';
import { useCallback, useState } from 'react';
import AlertDialog, { type AlertDialogOptionsProps } from './components/custom/AlertDialog';
import { defaultAlertConfig, setLocalStorage } from './lib/utils';
import type { loggedInUserInf, OrganizationType, purchasedPlansInf } from './lib/types';
import type { ISubscriptionConfig } from './lib/billingsdk-config';

interface IAppProps extends IRoutes {
  appRoutes: IRoutes['appRoutes'];
  publicRoutes?: IRoutes['publicRoutes'];
}

function App({ appRoutes, publicRoutes }: IAppProps) {
  useTheme();
  const [alertDlgOptions, setAlertDlgOptions] = useState<AlertDialogOptionsProps>(defaultAlertConfig);

  const [orgs, setOrgs] = useState<OrganizationType[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<loggedInUserInf>();
  const [activeOrg, setActiveOrg] = useState<OrganizationType>();
  const [purchasePlans, setPurchasePlans] = useState<purchasedPlansInf[]>([]);
  const [activePlan, setActivePlan] = useState<purchasedPlansInf>();
  const [subscriptionConfig, setSubscriptionConfig] = useState<ISubscriptionConfig>({} as ISubscriptionConfig);
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  const setActiveOrgHandler = useCallback(
    (org: OrganizationType) => {
      if (!org) return;

      setLocalStorage('activeOrgId', String(org.org_id));
      setActiveOrg(org);
    },
    [setActiveOrg],
  );

  return (
    <AppContext.Provider
      value={{
        alertDlgOptions,
        setAlertDlgOptions,
        orgs,
        setOrgs,
        loggedInUser: loggedInUser || ({} as loggedInUserInf),
        setLoggedInUser,
        activeOrg,
        setActiveOrg: setActiveOrgHandler,
        purchasePlans,
        setPurchasePlans,
        activePlan,
        setActivePlan,
        subscriptionConfig,
        setSubscriptionConfig,
        featureFlags,
        setFeatureFlags,
      }}
    >
      <Routes appRoutes={appRoutes} publicRoutes={publicRoutes} />
      <Toaster />
      <AlertDialog options={alertDlgOptions} />
    </AppContext.Provider>
  );
}

export default App;
