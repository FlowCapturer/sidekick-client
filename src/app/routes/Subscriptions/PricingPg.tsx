import { PricingTableFour } from '@/components/billingsdk/pricing-table-four';
import AccordionWrapper from '@/components/custom/AccordionWrapper';
import FullPageLoading from '@/components/custom/FullPageLoading';
import { TypographyHeading } from '@/components/custom/Typography/TypographyHeading';
import { appInfo } from '@/config/app-config';
import { getAxiosInstance } from '@/lib/axios-utils';
import type { ISubscriptionConfig } from '@/lib/billingsdk-config';
import AppContext from '@/store/AppContext';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function PricingTbl() {
  const navigate = useNavigate();
  const { subscriptionConfig, setSubscriptionConfig } = useContext(AppContext);
  const { plans, faqs } = subscriptionConfig;

  useEffect(() => {
    const fetchData = async () => {
      if ('plans' in subscriptionConfig === false) {
        const subscriptionConfigResponse = (await getAxiosInstance().get('/get-subscription-config')) as ISubscriptionConfig;
        setSubscriptionConfig(subscriptionConfigResponse);
      }
    };
    fetchData();
  }, [setSubscriptionConfig, subscriptionConfig]);

  if ('plans' in subscriptionConfig === false) {
    return <FullPageLoading />;
  }

  return (
    <div className="px-5">
      <PricingTableFour
        plans={plans}
        title="Choose Your Perfect Plan"
        theme="classic"
        description="Transform your project with our comprehensive pricing options designed for every need."
        subtitle={appInfo.appName}
        onPlanSelect={(planId: string, isYearly: boolean) => {
          navigate(`/infrastructure/checkout?plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`);
        }}
        size="small"
        className="w-full"
        showBillingToggle={true}
        billingToggleLabels={{
          monthly: 'Monthly',
          yearly: 'Yearly',
        }}
      />

      <div className="m-8 mx-auto max-w-200">
        <TypographyHeading className="mb-2">Need a custom plan?</TypographyHeading>
        <p className="text-muted-foreground">Contact our sales team for tailored solutions that fit your organization&apos;s unique needs.</p>

        <TypographyHeading className="mb-2 mt-15 font-medium text-lg">Frequently Asked Questions</TypographyHeading>
        <div className="mt-5">
          {faqs.map((faq, index) => (
            <div className="border-t" key={index}>
              <AccordionWrapper title={<h1 className="">{faq.question}</h1>}>
                <div className="">{faq.answer}</div>
              </AccordionWrapper>
            </div>
          ))}
        </div>

        <TypographyHeading className="mb-2 mt-15 font-medium text-lg">Still have questions?</TypographyHeading>
        <p className="text-muted-foreground">
          Reach out to our support team at{' '}
          <a href={`mailto:${appInfo.supportEmail}`} className="text-primary underline">
            {appInfo.supportEmail}
          </a>{' '}
          for personalized assistance.
        </p>
      </div>
    </div>
  );
}
