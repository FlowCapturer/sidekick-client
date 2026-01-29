import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { appInfo } from '@/config/app-config';
import { NavLink } from 'react-router';

export function AppHeader() {
  return (
    <SidebarMenu>
      <NavLink to={'/'}>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <appInfo.logo className="size-4" />
            </div> */}
            <div className="w-10 h-10 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg flex items-center justify-center">
              <appInfo.logo />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{appInfo.appName}</span>
              <span className="truncate text-xs">v{appInfo.version}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </NavLink>
    </SidebarMenu>
  );
}
