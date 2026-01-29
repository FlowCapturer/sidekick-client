import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';
import { useContext, lazy, Suspense } from 'react';
import AppContext from '@/store/AppContext';
import RequireAuth from './routes/components/RequireAuth';
import FullPageLoading from '../components/custom/FullPageLoading';

// Lazy load all route components
const Auth = lazy(() => import('./routes/auth/components/Auth'));
const LoginForm = lazy(() => import('./routes/auth/LoginForm'));
const RegistrationForm = lazy(() => import('./routes/auth/RegistrationForm'));
const Dashboard = lazy(() => import('./routes/Dashboard/Dashboard'));
const NotFound = lazy(() => import('./routes/NotFound'));
const ForgotPasswordForm = lazy(() => import('./routes/auth/ForgotPasswordForm'));
const OrgSetup = lazy(() => import('./routes/OrgSetup/OrgSetup'));
const CreateOrg = lazy(() => import('./routes/OrgSetup/CreateOrg'));
const JoinOrg = lazy(() => import('./routes/OrgSetup/JoinOrg'));
const OrgRootLayout = lazy(() => import('./routes/OrgSetup/components/OrgRootLayout'));
const ManageOrgs = lazy(() => import('./routes/OrgSetup/ManageOrgs'));
const PricingTbl = lazy(() => import('./routes/Subscriptions/PricingPg').then((m) => ({ default: m.PricingTbl })));
const SubscriptionMgmt = lazy(() => import('./routes/Subscriptions/SubscriptionMgmt'));
const Checkout = lazy(() => import('./routes/Subscriptions/Checkout'));
const PaymentHistory = lazy(() => import('./routes/Subscriptions/PaymentHistory'));
const GeneralSettingsPg = lazy(() => import('./routes/Dashboard/components/Settings/GeneralSettingsPg'));

export interface IRoutes {
  appRoutes: RouteObject[];
  publicRoutes?: RouteObject[];
}

function Routes({ appRoutes, publicRoutes = [] }: IRoutes) {
  const { featureFlags } = useContext(AppContext);

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      ),
      children: [
        ...appRoutes,
        {
          path: 'app/general-settings',
          Component: GeneralSettingsPg,
        },
        {
          path: 'app/*',
          element: <NotFound canShowHeader={false} />,
        },
      ],
    },
    ...(featureFlags.ff_enable_paid_subscription === false
      ? []
      : [
          {
            path: 'plans',
            Component: PricingTbl,
          },
        ]),
    ...publicRoutes,
    {
      path: 'infrastructure',
      element: (
        <RequireAuth>
          <OrgRootLayout />
        </RequireAuth>
      ),
      children: [
        ...(featureFlags.ff_enable_teams === false
          ? []
          : [
              {
                index: true,
                Component: OrgSetup,
              },
              {
                path: 'create-new-org',
                Component: CreateOrg,
              },
              {
                path: 'edit-org/:orgId',
                Component: CreateOrg,
              },
              {
                path: 'user-invitations',
                Component: JoinOrg,
              },
              {
                path: 'manage-infra',
                Component: ManageOrgs,
              },
            ]),
        ...(featureFlags.ff_enable_paid_subscription === false
          ? []
          : [
              {
                path: 'manage-subscription',
                Component: SubscriptionMgmt,
              },
              {
                path: 'checkout',
                Component: Checkout,
              },
              {
                path: 'payment-history',
                Component: PaymentHistory,
              },
            ]),
      ],
    },
    {
      Component: Auth,
      children: [
        {
          path: 'login',
          Component: LoginForm,
        },
        {
          path: 'forgot-password',
          Component: ForgotPasswordForm,
        },
        {
          path: 'register',
          Component: RegistrationForm,
        },
      ],
    },
    {
      path: '*',
      Component: NotFound,
    },
  ]);
  return (
    <Suspense fallback={<FullPageLoading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default Routes;
