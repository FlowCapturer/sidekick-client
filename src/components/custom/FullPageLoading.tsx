import { appInfo } from '@/config/app-config';
import LoadingCmp from './LoadingCmp';

const FullPageLoading = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6">
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-primary inline-flex gap-2">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <appInfo.logo className="size-4" />
        </div>
        <div className="grid flex-1 text-left leading-tight items-center text-foreground">{appInfo.appName}</div>
      </h3>
      <div className="inline-flex gap-1 ml-5">
        <LoadingCmp />
        Loading application...
      </div>
    </div>
  );
};

export default FullPageLoading;
