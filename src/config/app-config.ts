import { NotebookText } from 'lucide-react';

export const APP_INFO_ACCOUNT_TYPE = {
  TEAM: 'team',
  ORG: 'org',
};

export const appInfo = {
  appId: 'gamma_tech',
  appName: 'Gamma Tech',
  appDescription: 'Gamma Tech is a software company that provides a range of services to help businesses grow and succeed.',
  logo: NotebookText,
  version: '2.0.1',
  account_type_txt: {
    singular: 'Team',
    plural: 'Teams',
    value: APP_INFO_ACCOUNT_TYPE.TEAM,
  },
  supportEmail: 'support@gammatech.com',
  cloudFareKey: '',
  razorPayKey: '',
  themeColor: '#00c950',
  serverUrl: 'http://192.168.31.71:6001',
};

export const setAppInfo = (info: Partial<typeof appInfo>) => {
  Object.assign(appInfo, info);
};

export const setAccountType = (type: Partial<typeof APP_INFO_ACCOUNT_TYPE>) => {
  Object.assign(APP_INFO_ACCOUNT_TYPE, type);
};
