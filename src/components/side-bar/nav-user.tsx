import { BadgeCheck, ChevronsUpDown, CircleUserRound, CreditCard, LogOut, Sparkle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { setLocalStorage } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { useContext, useState } from 'react';
import AppContext from '@/store/AppContext';
import { isFreePlan } from '@/app/routes/Subscriptions/utils/subscription-utils';
import UserAccount from '@/app/UserAccount';

export function NavUser({ fname, lname, email, avatar }: { fname: string; lname: string; email: string; avatar: string }) {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { activePlan, featureFlags } = useContext(AppContext);
  const fullName = `${fname} ${lname}`;
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  return (
    <>
      <UserAccount isDialogOpen={isAccountDialogOpen} setIsDialogOpen={setIsAccountDialogOpen} />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar} alt={fullName} />
                  <AvatarFallback className="rounded-lg">
                    {fname[0].toLocaleUpperCase()}
                    {lname[0].toLocaleUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={fullName} />
                    <AvatarFallback className="rounded-lg">
                      {fname[0].toLocaleUpperCase()}
                      {lname[0].toLocaleUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsAccountDialogOpen(true)}>
                <CircleUserRound />
                Your Profile
              </DropdownMenuItem>
              {featureFlags.ff_enable_paid_subscription ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        setTimeout(
                          () => {
                            navigate('/plans');
                          },
                          isMobile ? 500 : 0,
                        );
                      }}
                    >
                      <Sparkle />
                      {isFreePlan(activePlan) ? 'Upgrade to premium' : 'View Plans'}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => {
                        setTimeout(
                          () => {
                            navigate('/infrastructure/manage-subscription');
                          },
                          isMobile ? 500 : 0,
                        );
                      }}
                    >
                      <BadgeCheck />
                      Subscriptions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setTimeout(
                          () => {
                            navigate('/infrastructure/payment-history');
                          },
                          isMobile ? 500 : 0,
                        );
                      }}
                    >
                      <CreditCard />
                      Payment History
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
                  </DropdownMenuGroup>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setLocalStorage('apiKey', '');
                  navigate('/login');
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
