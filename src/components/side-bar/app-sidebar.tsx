import * as React from 'react';
import { NavMain } from '@/components/side-bar/nav-main';
import { NavUser } from '@/components/side-bar/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
// import { appInfo } from "../lib/app-config";
import { OrgSwitcher } from '@/components/side-bar/org-switcher';
import { AppHeader } from './app-header';
import { navigationItems } from '@/lib/nav-menu';
import AppContext from '@/store/AppContext';

// This is sample data.
const data = navigationItems;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { loggedInUser, featureFlags } = React.useContext(AppContext);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppHeader />
        {featureFlags.ff_enable_teams && <OrgSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain navItems={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          email={loggedInUser?.email || ''}
          fname={loggedInUser?.fname || ''}
          lname={loggedInUser?.lname || ''}
          avatar={'/avatars/shadcn.jpg'}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
