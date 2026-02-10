import { Outlet } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { appInfo } from '../../../../config/app-config';
import { useContext, useEffect, useState } from 'react';
import { getAxiosInstance } from '@/lib';
import type { IFeatureFlagsResponse } from '@/lib/types';
import AppContext from '@/store/AppContext';
import { FullPageLoading } from '@/components/custom';

export default function Auth() {
  const { setFeatureFlags } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchFeatureFlags = async () => {
      try {
        setIsLoading(true);
        const featuresFlg = (await getAxiosInstance().get('/feature-flags', { signal: abortController.signal })) as IFeatureFlagsResponse;

        console.log('Fetched feature flags:', featuresFlg); // Debug log to verify fetched flags
        setFeatureFlags(featuresFlg.featureFlags);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatureFlags();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isLoading) {
    return <FullPageLoading />;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <appInfo.logo className="size-4" />
          </div>
          {appInfo.appName}
        </span>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome</CardTitle>
              <CardDescription>Please fill the below details to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{' '}
            <a href={appInfo.HOMEPAGE_URL + '/privacy-policy'} target="_blank">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
