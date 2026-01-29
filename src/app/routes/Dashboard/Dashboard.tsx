import { AppSidebar } from '@/components/side-bar/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router';
import AppBreadcrumb from './components/AppBreadcrumb';
import UpgradeToPro from '@/app/routes/Subscriptions/components/UpgradeToPro';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Dashboard() {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <header className="flex py-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <AppBreadcrumb />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-4">{isMobile ? <></> : <UpgradeToPro />}</div>
        </header>
        <div className="flex items-stretch flex-col flex-1 overflow-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
