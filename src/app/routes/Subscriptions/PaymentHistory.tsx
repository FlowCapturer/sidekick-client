import { InvoiceHistory, type InvoiceItem } from '@/components/billingsdk/invoice-history';
import { formatISODateWithTime24H } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { useContext } from 'react';
import { getCurrencySymbol } from './utils/subscription-utils';
import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';

const PaymentHistory = () => {
  const { purchasePlans, subscriptionConfig } = useContext(AppContext);
  const { plans } = subscriptionConfig;

  const invoices: InvoiceItem[] = [];

  purchasePlans.forEach((plan) => {
    const activePlan = plans.find((p) => p.id === plan.plan_id);

    const invoiceItem = {
      id: plan.z_order_id,
      date: formatISODateWithTime24H(plan.purchased_at),
      amount: `${getCurrencySymbol(plan.z_currency)}${plan.old_purchased_amount || plan.amount} (${plan.z_currency})`,
      status: plan.status as InvoiceItem['status'],
      description: `${activePlan?.title} — ${plan.for_months} months, ${plan.old_purchased_for_no_users || plan.for_no_users} users`,
      // invoiceUrl: plan.invoiceUrl,
      transactionId: plan.z_order_id,
    };

    if (plan.updatedRecords) {
      plan.updatedRecords.forEach((record) => {
        invoices.push({
          id: record.z_order_id,
          date: formatISODateWithTime24H(record.updated_at),
          amount: `${getCurrencySymbol(record.z_currency)}${record.amount} (${record.z_currency})`,
          status: record.status as InvoiceItem['status'],
          description: `Added ${record.for_no_users} more users, in ${plan.z_order_id}`,
          // invoiceUrl: record.invoiceUrl,
          transactionId: record.z_order_id,
        });
      });
    }
    invoices.push(invoiceItem);
  });

  invoices.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  return (
    <FlexColsLayout>
      <div className="w-full sm:max-w-250 mx-auto">
        <InvoiceHistory
          title="Payment History"
          description="Your past payment receipts."
          className="shadow-none border-none"
          invoices={invoices.reverse()}
        />
      </div>
    </FlexColsLayout>
  );
};

export default PaymentHistory;
