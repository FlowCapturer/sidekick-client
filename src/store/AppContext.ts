import type { AlertDialogOptionsProps } from '@/components/custom/AlertDialog';
import type { ISubscriptionConfig } from '@/lib/billingsdk-config';
import type { loggedInUserInf, OrganizationType, purchasedPlansInf } from '@/lib/types';
import { defaultAlertConfig } from '@/lib/utils';
import { createContext } from 'react';

interface AppContextType {
  setAlertDlgOptions: (options: AlertDialogOptionsProps) => void;
  alertDlgOptions: AlertDialogOptionsProps;
  orgs: OrganizationType[];
  setOrgs: (orgs: OrganizationType[]) => void;
  loggedInUser: loggedInUserInf;
  setLoggedInUser: (loggedInUser: loggedInUserInf) => void;
  activeOrg: OrganizationType | undefined;
  setActiveOrg: (org: OrganizationType) => void;
  purchasePlans: purchasedPlansInf[];
  setPurchasePlans: (purchasePlans: purchasedPlansInf[]) => void;
  activePlan: purchasedPlansInf | undefined;
  setActivePlan: (plan: purchasedPlansInf) => void;
  subscriptionConfig: ISubscriptionConfig;
  setSubscriptionConfig: (subscriptionConfig: ISubscriptionConfig) => void;
  featureFlags: Record<string, boolean>;
  setFeatureFlags: (flags: Record<string, boolean>) => void;
}

const AppContext = createContext<AppContextType>({
  setAlertDlgOptions: () => {},
  alertDlgOptions: defaultAlertConfig,
  orgs: [],
  setOrgs: () => {},
  loggedInUser: null as unknown as loggedInUserInf,
  setLoggedInUser: () => {},
  activeOrg: undefined,
  setActiveOrg: () => {},
  purchasePlans: [],
  setPurchasePlans: () => {},
  activePlan: null as unknown as purchasedPlansInf,
  setActivePlan: () => {},
  subscriptionConfig: {} as ISubscriptionConfig,
  setSubscriptionConfig: () => {},
  featureFlags: {},
  setFeatureFlags: () => {},
});

export default AppContext;
