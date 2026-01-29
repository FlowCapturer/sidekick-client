import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTriggerWrapper } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router';
import { getModuleNameFromUrl, isSameNavItem } from '@/lib/utils';
import type { NavGroup, NavItem } from '@/lib/types';

interface NavMainProps {
  navItems: NavGroup[];
}

export function NavMain({ navItems }: NavMainProps) {
  const location = useLocation();
  const moduleName = location.pathname;
  const currentPath = getModuleNameFromUrl(moduleName);

  const getModuleLink = (path: string) => `app/${path}`;

  const selectedItemCls = `bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground`;

  const getSidebarMenuBtn = (item: NavItem) => {
    const sidebarMenuBtn = (
      <SidebarMenuButton tooltip={item.title} className={'cursor-pointer ' + (isSameNavItem(currentPath, item.url || '') ? selectedItemCls : '')}>
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        {item.items && <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />}
      </SidebarMenuButton>
    );

    if (!item.url) {
      return sidebarMenuBtn;
    }

    return (
      <NavLink to={getModuleLink(item.url)} className="w-full">
        {sidebarMenuBtn}
      </NavLink>
    );
  };

  return (
    <>
      {navItems.map((navItem) => (
        <SidebarGroup key={navItem.title}>
          <SidebarGroupLabel>{navItem.title}</SidebarGroupLabel>
          <SidebarMenu>
            {navItem.items.map((item) => {
              const hasSelectedSubItem = item.items && item.items.some((subItem) => isSameNavItem(currentPath, subItem.url));

              return (
                <Collapsible key={item.title} asChild defaultOpen={hasSelectedSubItem} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTriggerWrapper isCollapsible={!!item.items} asChild>
                      {getSidebarMenuBtn(item)}
                    </CollapsibleTriggerWrapper>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className={isSameNavItem(currentPath, subItem.url) ? selectedItemCls : ''}>
                              <NavLink to={getModuleLink(subItem.url)} title={subItem.title}>
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
