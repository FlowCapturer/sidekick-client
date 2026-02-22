import DataTable from '@/components/custom/DataTable/DataTable';
import LinkWrapper from '@/components/custom/LinkWrapper';
import { Button } from '@/components/ui/button';
import useAlertDialog from '@/hooks/useAlertDialog';
import { APP_INFO_ACCOUNT_TYPE, appInfo } from '@/config/app-config';
import { getAxiosInstance } from '@/lib/axios-utils';
import { ROLES } from '@/lib/enums';
import { showSuccessToast, showWarningToast } from '@/lib/toast-helper';
import type { OrganizationType, OrganizationTypeResponse, purchasedPlansInf } from '@/lib/types';
import AppContext from '@/store/AppContext';
import { Check, Plus, X } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import useOrgHelper from './hooks/useOrgHelper';
import { INVITATION_ENUMS } from '@/lib/utils';
import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import PremiumIcon from '../Subscriptions/components/PremiumIcon';
import { useNavigate } from 'react-router';

const ManageOrgs = () => {
  const { orgs, setOrgs, featureFlags, loggedInUser, setActiveOrg, activeOrg } = useContext(AppContext);
  const dlg = useAlertDialog();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { editOrganization } = useOrgHelper();

  const reloadData = async () => {
    setLoading(true);
    try {
      const orgsRes = (await getAxiosInstance().get('organization')) as OrganizationTypeResponse;
      setOrgs(orgsRes?.orgs || []);

      if (activeOrg) {
        //If activeOrg exits, and if activeOrg is no longer in the list, reset it
        const stillExists = orgsRes.orgs.find((org) => org.org_id === activeOrg.org_id);
        if (!stillExists) {
          setActiveOrg(orgsRes.orgs[0]);
        }
      } else {
        //If no activeOrg, set to first org in the list
        if (orgsRes.orgs.length > 0) setActiveOrg(orgsRes.orgs[0]);
      }
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgs.length > 0 && !activeOrg) {
      setActiveOrg(orgs[0]);
    }
  }, []);

  // useEffect(() => {
  //   reloadData();
  // }, []);

  return (
    <FlexColsLayout>
      <div className="flex-1 flex p-5 sm:px-10 px-4 flex-col sm:w-300 m:w-full w-full mx-auto">
        {/* <TypographyHeading className="inline-flex mb-4">
        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <UsersRound className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
        <span className="ml-2">{appInfo.account_type_txt.plural}</span>
      </TypographyHeading> */}
        <DataTable
          loading={loading}
          toolbarConfig={{
            canShowSearchField: true,
            searchFieldConfig: {
              placeholder: `Search by ${appInfo.account_type_txt.singular} Name...`,
              searchField: 'org_name',
            },
            canShowColumnsBtn: false,
            additionalJSX: [
              <LinkWrapper to={'/infrastructure/create-new-org'}>
                <Button variant="default">
                  <Plus /> Create new {appInfo.account_type_txt.singular}
                </Button>
              </LinkWrapper>,
            ],
            refreshBtn: {
              canShow: true,
              onClick: reloadData,
            },
          }}
          data={orgs}
          actions={[
            {
              id: 'actionId1',
              headerText: 'Edit',
              onClick: (record) => {
                const org = record as OrganizationType;
                editOrganization(org);
              },
            },
            {
              id: 'actionId2',
              headerText: 'Delete',
              onClick: (record) => {
                const org = record as OrganizationType;
                if (!ROLES.Is_ADMIN(org.role_id)) {
                  showWarningToast({
                    header: 'Alert',
                    description: (
                      <>
                        You are not allowed to delete the <b>{org.org_name}</b> {appInfo.account_type_txt.singular}.
                      </>
                    ),
                  });
                  return;
                }
                dlg.showAlertBox({
                  type: 'CONFIRM',
                  text: `Are you sure you want to delete "${org.org_name}" ${appInfo.account_type_txt.singular.toLocaleLowerCase()}?`,
                  async onClose(result) {
                    if (result !== 'CONFIRM') {
                      return;
                    }

                    setLoading(true);
                    try {
                      const res: { message: string } = await getAxiosInstance().delete('organization/' + org.org_id);
                      showSuccessToast({
                        header: `${appInfo.account_type_txt.singular} has been deleted successfully.`,
                        description: res.message,
                      });

                      await reloadData();
                    } finally {
                      setLoading(false);
                    }
                  },
                });
              },
            },
            {
              id: 'separate',
              headerText: 'SEPARATOR',
            },
            {
              id: 'actionId3',
              headerText: `Leave this ${appInfo.account_type_txt.singular.toLocaleLowerCase()}`,
              onClick: (record) => {
                const org = record as OrganizationType;
                // if (record.org_created_by === loggedInUser) {
                // }

                dlg.showAlertBox({
                  type: 'CONFIRM',
                  text: `Are you sure you want to leave this ${appInfo.account_type_txt.singular.toLocaleLowerCase()}? You can't re-join until an administrator invites you again.`,
                  async onClose(result) {
                    if (result !== 'CONFIRM') {
                      return;
                    }

                    setLoading(true);
                    try {
                      const reqJson = {
                        org_id: org.org_id,
                        user_opinion: INVITATION_ENUMS.LEFT,
                      };
                      await getAxiosInstance().put('invitation', reqJson);

                      showSuccessToast({
                        header: `You have successfully left this ${appInfo.account_type_txt.singular.toLocaleLowerCase()}.`,
                        description: '',
                      });

                      await reloadData();
                    } finally {
                      setLoading(false);
                    }
                  },
                });
              },
            },
            {
              id: 'separate2',
              headerText: 'SEPARATOR',
            },
            {
              id: 'actionId4',
              headerText: 'Impersonate',
              onClick: (record) => {
                const org = record as OrganizationType;
                setActiveOrg(org);
                navigate('/');
              },
            },
          ]}
          columns={[
            ...(featureFlags.ff_enable_paid_subscription === false
              ? []
              : [
                  {
                    id: 'active_purchased_plan',
                    headerText: '',
                    enableSorting: false,
                    enableHiding: false,
                    type: 'string' as const,
                    renderer(_: unknown, cellValue: unknown) {
                      const purchasedPlan = cellValue as purchasedPlansInf;

                      return <PremiumIcon purchasedPlan={purchasedPlan} />;
                    },
                  },
                ]),
            {
              id: 'org_name',
              headerText: `${appInfo.account_type_txt.singular} Name`,
              enableSorting: true,
              enableHiding: true,
            },
            ...(appInfo.account_type_txt.value === APP_INFO_ACCOUNT_TYPE.ORG
              ? [
                  {
                    id: 'org_address',
                    headerText: 'Address',
                    enableSorting: true,
                    enableHiding: true,
                  },
                  {
                    id: 'org_state',
                    headerText: 'State',
                    enableSorting: true,
                    enableHiding: true,
                  },
                  {
                    id: 'org_country',
                    headerText: 'Country',
                    enableSorting: true,
                    enableHiding: true,
                  },
                ]
              : []),
            {
              id: 'role_id',
              headerText: 'Role',
              enableSorting: true,
              enableHiding: true,
              type: 'string',
              renderer(_, cellValue) {
                return ROLES.DISPLAY_TEXT(cellValue as number);
              },
            },
            {
              id: 'org_created_by',
              headerText: 'Created By Me?',
              enableSorting: false,
              enableHiding: true,
              renderer(_, cellValue) {
                return Number(cellValue) === Number(loggedInUser.id) ? <Check /> : <X />;
              },
            },
            {
              id: 'updated_at',
              headerText: 'Updated On',
              enableSorting: true,
              enableHiding: true,
              type: 'date',
            },
            {
              id: 'created_at',
              headerText: 'Created On',
              enableSorting: true,
              enableHiding: true,
              type: 'date',
            },
          ]}
        />
      </div>
    </FlexColsLayout>
  );
};

export default ManageOrgs;
