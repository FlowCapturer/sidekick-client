import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/useIsMobile';
import { appInfo } from '@/config/app-config';
import AppContext from '@/store/AppContext';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';

const OrgRootLayout = () => {
  const { orgs, featureFlags } = useContext(AppContext);
  const forceOrgJoin = featureFlags.ff_enable_teams && orgs.length === 0;
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const canShowBackBtn = () => {
    if (location.pathname === '/infrastructure') return false;
    return true;
  };

  const navItems = [
    ...(featureFlags.ff_enable_teams
      ? [
          {
            title: appInfo.account_type_txt.plural,
            url: '/infrastructure/manage-infra',
          },
          {
            title: 'Invitations',
            url: '/infrastructure/user-invitations',
          },
        ]
      : []),
    ...(featureFlags.ff_enable_paid_subscription
      ? [
          {
            title: 'Subscriptions',
            url: '/infrastructure/manage-subscription',
          },
          {
            title: 'Payment History',
            url: '/infrastructure/payment-history',
          },
        ]
      : []),
  ];

  const canShowNavItems = () => {
    return navItems.some((item) => item.url === location.pathname);
  };

  return (
    <FlexColsLayout className="h-screen sm:pt-10 pt-5">
      <div className="scroll-m-20 text-xl inline-flex gap-2 px-5 pb-5">
        {canShowBackBtn() && (
          <Button variant={'ghost'} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Back
          </Button>
        )}
        <span className="flex-1"></span>
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <appInfo.logo className="size-4" />
        </div>
        <div className="grid text-left leading-tight items-center text-foreground font-semibold tracking-tight">{appInfo.appName}</div>
        <span className="flex-1"></span>
        {forceOrgJoin ? (
          <NavLink to="/login">
            <Button variant={'ghost'}>
              <LogOut />
              Log out
            </Button>
          </NavLink>
        ) : (
          <NavLink to={'/'}>
            <Button variant={'ghost'} title="close">
              <X size={20} />
            </Button>
          </NavLink>
        )}
      </div>
      {canShowNavItems() && (
        <FlexColsLayout doNotAppendFlex1={true} className="mx-auto mb-4">
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">
                  <Menu />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.title} onClick={() => navigate(item.url)}>
                    {item.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ButtonGroup>
              {navItems.map((item) => (
                <Button key={item.title} variant={location.pathname === item.url ? 'default' : 'outline'} onClick={() => navigate(item.url)}>
                  {item.title}
                </Button>
              ))}
            </ButtonGroup>
          )}
        </FlexColsLayout>
      )}
      {/* <Separator /> */}
      <Outlet />
    </FlexColsLayout>
  );
};

export default OrgRootLayout;
