import { appInfo } from '@/config/app-config';
import { NavLink } from 'react-router';

const NotFound: React.FC<{ canShowHeader?: boolean }> = ({ canShowHeader = true }) => {
  return (
    <div className="flex flex-col stretch justify-center gap-4 items-center flex-1 p-5">
      {canShowHeader && (
        <>
          <h1 className="text-3xl font-bold text-primary p-0">{appInfo.appName}</h1>
          <p className="text-sm">{appInfo.appDescription}</p>
        </>
      )}
      <div className="flex flex-col justify-center">
        <div className="text-muted-foreground mb-4 text-sm">404 Page Not Found</div>
        <NavLink to="/" className="p-2 bg-primary text-primary-foreground rounded-md transition-colors text-sm">
          Go to Homepage
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
