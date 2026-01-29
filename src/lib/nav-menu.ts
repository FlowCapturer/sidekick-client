import { Bookmark, BookOpen, Settings2, SquarePen } from 'lucide-react';
import type { IVirtualChildOf, NavGroup } from './types';

export const navigationItems: {
  orgs: Array<{ name: string; description: string }>;
  navMain: NavGroup[];
  virtualChildOf: IVirtualChildOf[];
} = {
  orgs: [
    {
      name: 'Acme Corp.',
      // logo: AudioWaveform,
      description: 'Startup',
    },
  ],
  navMain: [
    {
      title: 'Your Work',
      items: [
        {
          title: 'Sample',
          icon: SquarePen,
          // isExpanded: true,
          url: 'sample-documents',
        },
        {
          title: 'Sample Saved',
          icon: Bookmark,
          // isExpanded: true,
          url: 'sample-saved-documents',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Documentation',
          icon: BookOpen,
          items: [
            {
              title: 'Sample Get Started',
              url: 'sample-doc-get-started',
            },
            {
              title: 'Sample Tutorials',
              url: 'sample-tutorials',
            },
          ],
        },
        {
          title: 'Settings',
          icon: Settings2,
          items: [
            {
              title: 'Sample General',
              url: 'sample-general-settings',
            },
            {
              title: 'Sample Active Plan',
              url: 'sample-active-plan-setting',
            },
          ],
        },
      ],
    },
  ],
  virtualChildOf: [],
};

const loadRecursiveChild = (elements: any[], result: any[], parent?: any): void => {
  elements.forEach((el: any) => {
    const { items, ...otherProps } = el;
    otherProps.parent = parent;
    result.push(otherProps);

    if (items) loadRecursiveChild(items, result, otherProps);
  });
};

export const getFlatNavigationItems = () => {
  const result: any[] = [];
  const navTree = navigationItems.navMain;

  loadRecursiveChild(navTree, result, undefined);

  return result;
};

export const setNavigationItems = (navItems: NavGroup[], virtualChildOf: IVirtualChildOf[]) => {
  navigationItems.navMain = navItems;
  navigationItems.virtualChildOf = virtualChildOf || [];
};
