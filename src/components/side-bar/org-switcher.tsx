import React, { useContext } from 'react';
import { ChevronsUpDown, FolderKanban, Pen, Plus, UserRoundPlus, Users2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

import AppContext from '@/store/AppContext';
import { useNavigate } from 'react-router';
import { appInfo } from '@/config/app-config';
import { generatePublicId, isValidId } from '@/lib/utils';
import { ROLES } from '@/lib/enums';
import { TooltipWrapper } from '../custom/TooltipWrapper';
import { showErrorToast } from '@/lib/toast-helper';
import PremiumIcon from '@/app/routes/Subscriptions/components/PremiumIcon';

interface OrgSwitcherMenuProps {
  text: React.ReactNode;
  link: string;
  icon: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
  addTopSeparator?: boolean;
  key: string;
}

export function OrgSwitcher() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { orgs, activeOrg, setActiveOrg } = useContext(AppContext);
  const navigate = useNavigate();

  const getOrgSpecificOptions = () => {
    const options: OrgSwitcherMenuProps[] = [];

    if (activeOrg && isValidId(activeOrg?.org_id || 0)) {
      const isAdmin = ROLES.Is_ADMIN(activeOrg?.role_id || NaN);
      options.push(
        {
          text: <>Invite team members</>,
          link: `/infrastructure/edit-org/${generatePublicId(activeOrg?.org_id || 0)}`,
          disabled: !isAdmin,
          icon: <UserRoundPlus className="size-4" />,
          tooltip: isAdmin
            ? `Invite peoples to "${activeOrg.org_name}" ${appInfo.account_type_txt.singular.toLocaleLowerCase()}`
            : `You are not an admin for "${
                activeOrg.org_name
              }" ${appInfo.account_type_txt.singular.toLocaleLowerCase()}, Only admins can invite peoples.`,
          key: 'invite-peoples',
        },
        {
          text: <>Edit {appInfo.account_type_txt.singular.toLocaleLowerCase()}</>,
          link: `/infrastructure/edit-org/${generatePublicId(activeOrg?.org_id || 0)}`,
          disabled: !isAdmin,
          icon: <Pen className="size-4" />,
          tooltip: isAdmin
            ? `Edit "${activeOrg.org_name}" ${appInfo.account_type_txt.singular.toLocaleLowerCase()} details`
            : `You are not an admin for "${
                activeOrg.org_name
              }" ${appInfo.account_type_txt.singular.toLocaleLowerCase()}, Only admins can invite peoples.`,
          key: 'edit-org',
        },
      );
    }

    options.push(
      {
        addTopSeparator: true,
        text: <>Create new {appInfo.account_type_txt.singular.toLocaleLowerCase()}</>,
        link: '/infrastructure/create-new-org',
        icon: <Plus className="size-4" />,
        key: 'create-new-org',
      },
      {
        text: <>View all {appInfo.account_type_txt.plural.toLocaleLowerCase()}</>,
        link: '/infrastructure/manage-infra',
        icon: <FolderKanban className="size-4" />,
        key: 'view-all-orgs',
      },
      {
        addTopSeparator: true,
        text: <>Check invites</>,
        link: 'infrastructure/user-invitations',
        icon: <UserRoundPlus className="size-4" />,
        key: 'check-invitations',
      },
    );

    return (
      <>
        {options.map((rec) => {
          return (
            <TooltipWrapper key={rec.key} content={<>{rec.tooltip}</>} side="right" canShowTooltip={!!rec.tooltip}>
              <div key={rec.key}>
                {rec.addTopSeparator ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  key={rec.link}
                  className="gap-2 p-2 cursor-pointer"
                  // disabled={rec.disabled}
                  onClick={() => {
                    setOpenMobile(false);
                    setTimeout(
                      () => {
                        if (rec.disabled) {
                          showErrorToast({
                            header: 'Action not allowed!',
                            description: rec.tooltip || 'You cannot access this option',
                          });
                          return;
                        }
                        navigate(rec.link);
                      },
                      isMobile ? 500 : 0,
                    );
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent" title={rec.tooltip}>
                    {rec.icon}
                  </div>
                  <div className="text-muted-foreground font-medium">{rec.text}</div>
                </DropdownMenuItem>
              </div>
            </TooltipWrapper>
          );
        })}
      </>
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                {activeOrg?.logo ? <activeOrg.logo className="size-4" /> : <Users2 className="size-4" />}
              </div>

              {activeOrg ? (
                <TooltipWrapper content={activeOrg.org_name + ' - ' + activeOrg.org_external_id} side="right" canShowTooltip={true}>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{activeOrg.org_name}</span>
                    <span className="truncate text-xs">{activeOrg.org_external_id}</span>
                  </div>
                </TooltipWrapper>
              ) : (
                <div className="truncate text-xs">No Active {appInfo.account_type_txt.singular}, select one.</div>
              )}

              {activeOrg?.active_purchased_plan && (
                <div className="flex items-center justify-center rounded-md border">
                  <PremiumIcon purchasedPlan={activeOrg.active_purchased_plan} />
                </div>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">{appInfo.account_type_txt.plural}</DropdownMenuLabel>
            {orgs.map((org) => (
              <DropdownMenuItem key={org.org_id} onClick={() => setActiveOrg(org)} className="gap-2 p-2">
                {org.logo ? (
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <org.logo className="size-3.5 shrink-0" />
                  </div>
                ) : (
                  <></>
                )}
                {org.org_name}
                {org.active_purchased_plan && (
                  <div className="ml-auto flex items-center justify-center rounded-md border">
                    <PremiumIcon purchasedPlan={org.active_purchased_plan} />
                  </div>
                )}
                {/* <DropdownMenuShortcut></DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {getOrgSpecificOptions()}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
