import { createBrowserRouter, Outlet, RouterProvider, type RouteObject } from 'react-router';
import { useContext, lazy, Suspense, useMemo } from 'react';
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

const EMPTY_ROUTES: RouteObject[] = [];

export interface IRoutes {
  appRoutes: RouteObject[];
  publicRoutes?: RouteObject[];
}

type FeatureFlag = 'ff_enable_paid_subscription' | 'ff_enable_teams';

function FeatureFlagRoute({ flag }: { flag: FeatureFlag }) {
  const { featureFlags } = useContext(AppContext);

  if (featureFlags[flag] === false) {
    return <NotFound canShowHeader={false} />;
  }

  return <Outlet />;
}

function Routes({ appRoutes, publicRoutes = EMPTY_ROUTES }: IRoutes) {
  const router = useMemo(() => {
    return createBrowserRouter([
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
      {
        element: <FeatureFlagRoute flag="ff_enable_paid_subscription" />,
        children: [
          {
            path: 'plans',
            Component: PricingTbl,
          },
        ],
      },
      ...publicRoutes,
      {
        path: 'infrastructure',
        element: (
          <RequireAuth>
            <OrgRootLayout />
          </RequireAuth>
        ),
        children: [
          {
            element: <FeatureFlagRoute flag="ff_enable_teams" />,
            children: [
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
            ],
          },
          {
            element: <FeatureFlagRoute flag="ff_enable_paid_subscription" />,
            children: [
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
            ],
          },
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
  }, [appRoutes, publicRoutes]);
  return (
    <Suspense fallback={<FullPageLoading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default Routes;
