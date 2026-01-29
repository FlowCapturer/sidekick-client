import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import TabularLayout from '@/components/custom/Layouts/TabularLayout';
import LinkWrapper from '@/components/custom/LinkWrapper';
import LoadingCmp from '@/components/custom/LoadingCmp';
import { TypographyP } from '@/components/custom/Typography/TypographyP';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useAlertDialog from '@/hooks/useAlertDialog';
import useFetchData from '@/hooks/useFetchData';
import { appInfo } from '@/config/app-config';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showSuccessToast } from '@/lib/toast-helper';
import type { IEachInvitation, IInvitationsResponse, OrganizationTypeResponse } from '@/lib/types';
import { formatISODateWithTime24H, isTruthyValue, INVITATION_ENUMS } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { Check, X } from 'lucide-react';
import { useContext, useState } from 'react';

const JoinOrg = () => {
  const { loading: fetchingInvitations, response: invitationsResponse } = useFetchData<IInvitationsResponse>('/invitation');

  const dlg = useAlertDialog();

  const invitations = invitationsResponse?.invites.filter((rec) => rec.user_opinion !== INVITATION_ENUMS.ACCEPTED);

  const [isSaving, setIsSaving] = useState(-1);

  const { setOrgs } = useContext(AppContext);

  const respondToInvitation = async (selectedOption: (typeof INVITATION_ENUMS)[keyof typeof INVITATION_ENUMS], org: IEachInvitation) => {
    if (!org) return;
    try {
      const orgId = parseInt(org.org_id, 10);
      setIsSaving(orgId);

      const reqJson = {
        org_id: orgId,
        user_opinion: selectedOption,
      };

      await getAxiosInstance().put('/invitation', reqJson);

      const orgsRes = (await getAxiosInstance().get('organization')) as OrganizationTypeResponse;
      setOrgs(orgsRes?.orgs || []);

      //locally setting this flag, to filter out the invitations
      org.user_opinion = INVITATION_ENUMS.ACCEPTED;

      showSuccessToast({
        description: `Invitation for ${org.org_name} ${appInfo.account_type_txt.singular} has been ${
          selectedOption === INVITATION_ENUMS.ACCEPTED ? 'accepted' : 'rejected'
        } successfully.`,
      });
    } finally {
      setIsSaving(-1);
    }
  };

  const contentJSX = () => {
    if (fetchingInvitations) {
      return (
        <span>
          <FlexColsLayout layout="horizontal" className="text-center mt-5 justify-center items-center">
            <LoadingCmp />
          </FlexColsLayout>
        </span>
      );
    }

    if (!invitations || invitations.length <= 0) {
      return (
        <TypographyP className="text-center mt-5">
          You don't have any invitations from any {appInfo.account_type_txt.singular.toLocaleLowerCase()}.
        </TypographyP>
      );
    }

    const rows = invitations
      .filter((rec) => isTruthyValue(rec.org_user_is_active))
      .map((rec) => [
        <Label className="font-normal">
          <span className="font-semibold">{rec.org_name},</span>sent on &nbsp;
          {formatISODateWithTime24H(rec.sent_at)}
        </Label>,
        <FlexColsLayout className="gap-1 justify-end pr-3" layout="horizontal">
          <Button
            onClick={() => respondToInvitation(INVITATION_ENUMS.ACCEPTED, rec)}
            loading={isSaving === parseInt(rec.org_id, 10)}
            disabled={isSaving !== -1}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check /> Accept
          </Button>
          <Button
            variant={'destructive'}
            loading={isSaving === parseInt(rec.org_id, 10)}
            disabled={isSaving !== -1}
            onClick={() => {
              dlg.showAlertBox({
                type: 'CONFIRM',
                text: `Are you sure you want to reject this ${appInfo.account_type_txt.singular.toLocaleLowerCase()} request? You can't re-join until an administrator invites you again.`,
                async onClose(result) {
                  if (result !== 'CONFIRM') {
                    return;
                  }

                  respondToInvitation(INVITATION_ENUMS.REJECTED, rec);
                },
              });
            }}
          >
            <X /> Reject
          </Button>
        </FlexColsLayout>,
      ]);

    return (
      <TabularLayout
        className="w-full mt-5 text-sm border-b-1"
        leftCls="w-full sm:w-100 text-left sm:text-right pt-3"
        rightCls="sm:pt-0 pt-2"
        rowCls="flex-col sm:flex-row border-t-1 p-2 hover:bg-muted"
        child={rows.flat()}
      />
    );
  };

  return (
    <FlexColsLayout layout="horizontal">
      <span className="md:flex-1 flex-none"></span>
      <FlexColsLayout className="flex-4 max-w-4xl mt-5">
        {/* <TypographyHeading className="text-center pl-4">Invitations</TypographyHeading> */}
        <FlexColsLayout>
          {contentJSX()}
          <span className="mt-5 text-center">
            <Button className="mt-5" variant={'link'}>
              <LinkWrapper to={'/infrastructure/manage-infra'}>View all {appInfo.account_type_txt.plural.toLocaleLowerCase()}</LinkWrapper>
            </Button>
          </span>
        </FlexColsLayout>
      </FlexColsLayout>
      <span className="md:flex-1 flex-none"></span>
    </FlexColsLayout>
  );
};

export default JoinOrg;
