import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrencySymbol } from '../utils/subscription-utils';
import { LogIn, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatISODateWithTime24H } from '@/lib/utils';
import LinkWrapper from '@/components/custom/LinkWrapper';
import { Button } from '@/components/ui/button';
import { useContext } from 'react';
import type { purchasedPlansInf } from '@/lib/types';
import AppContext from '@/store/AppContext';
import PremiumHighlighter from '@/components/custom/PremiumHighlighter';

interface IUpcomingPlans {
  upcomingPlans: purchasedPlansInf[] | any[];
  Icon: LucideIcon;
  title: string;
  badgeText: string;
  isFreePlan?: boolean;
}

const UpcomingPlans = ({ upcomingPlans, Icon, title, badgeText, isFreePlan = false }: IUpcomingPlans) => {
  const { subscriptionConfig, orgs, featureFlags } = useContext(AppContext);
  const { plans } = subscriptionConfig;

  return (
    <Card key="upcoming-plans" className="mt-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {upcomingPlans.length ? (
            upcomingPlans.map((purchasedPlan) => {
              const plan = plans.find((p) => p.id === purchasedPlan.plan_id);

              return (
                <div
                  key={purchasedPlan.z_order_id}
                  className="w-full relative p-3 sm:p-4 rounded-xl bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border border-border/50 overflow-hidden"
                >
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-semibold">{plan?.title} Plan</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={purchasedPlan.status === 'active' ? 'default' : 'outline'}
                              className="shadow-sm text-xs sm:text-sm bg-primary/90 hover:bg-primary border-0 font-medium text-primary-foreground"
                            >
                              {getCurrencySymbol(purchasedPlan.z_currency)}
                              {purchasedPlan.amount}
                            </Badge>
                            <Badge variant="outline" className="shadow-sm text-xs sm:text-sm border-border/60 bg-background/50 backdrop-blur-sm">
                              {badgeText}
                            </Badge>
                          </div>
                        </div>
                        {isFreePlan ? (
                          <>
                            <div className="mt-5">
                              <LinkWrapper to={'/plans'}>
                                {/* <Button className={'mt-5'}>
                                <SparkleIcon /> 
                                Purchase Plan
                                </Button> */}
                                <PremiumHighlighter>{'Upgrade to premium'}</PremiumHighlighter>
                              </LinkWrapper>

                              {featureFlags.ff_enable_teams && orgs.length === 0 && (
                                <LinkWrapper to={'/infrastructure/create-new-org'}>
                                  <Button className={'ml-2'} variant={'outline'}>
                                    <LogIn /> Continue with Free Plan
                                  </Button>
                                </LinkWrapper>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="relative">
                            <span className="text-xs sm:text-sm text-muted-foreground relative z-10">
                              <p>
                                {purchasedPlan.for_no_users} Users for {purchasedPlan.for_months} Months
                              </p>
                              <p>Start Date: {formatISODateWithTime24H(purchasedPlan.startAt)}</p>
                              <p>End Date: {formatISODateWithTime24H(purchasedPlan.endAt)}</p>
                              <p>Order Id: {purchasedPlan.z_order_id}</p>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground">No {badgeText} Plans</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingPlans;
