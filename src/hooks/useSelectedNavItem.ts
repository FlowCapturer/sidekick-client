import { findNavMenu, getModuleNameFromUrl } from '@/lib/utils';
import { useLocation } from 'react-router';

const useSelectedNavItem = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  if (!currentPath || currentPath === '/')
    return {
      title: 'Dashboard',
    };

  const moduleName = getModuleNameFromUrl(currentPath);
  const selectedNavItem = findNavMenu(moduleName);

  if (!selectedNavItem) {
    return {
      title: 'Not Found',
      url: 'notFound',
    };
  }

  return selectedNavItem;
};

export default useSelectedNavItem;
