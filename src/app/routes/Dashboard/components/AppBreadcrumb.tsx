import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { NavItem } from '@/lib/types';
import type { JSX } from 'react';
import { Fragment } from 'react';
import useSelectedNavItem from '@/hooks/useSelectedNavItem';
import { LinkWrapper } from '@/components/custom';

const AppBreadcrumb = () => {
  const selectedNavItem = useSelectedNavItem();

  const getBreadcrumbItem = (navItem: NavItem, isRoot: boolean): JSX.Element[] => {
    let result: JSX.Element[] = [];

    result.push(
      <Fragment key={navItem.title}>
        <BreadcrumbItem>
          {isRoot ? (
            <BreadcrumbPage>{navItem.title}</BreadcrumbPage>
          ) : navItem.url ? (
            <LinkWrapper to={'app/' + (navItem.url || '')}>
              <BreadcrumbLink>{navItem.title}</BreadcrumbLink>
            </LinkWrapper>
          ) : (
            <BreadcrumbLink>{navItem.title}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isRoot && <BreadcrumbSeparator />}
      </Fragment>,
    );

    if (navItem.parent) {
      result = [getBreadcrumbItem(navItem.parent, false), ...result].flat();
    }

    return result;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{getBreadcrumbItem(selectedNavItem, true)}</BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
