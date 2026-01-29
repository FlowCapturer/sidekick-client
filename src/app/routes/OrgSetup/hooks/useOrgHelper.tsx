import { showSuccessToast, showWarningToast } from '@/lib/toast-helper';
import type { OrganizationType, TeamMembersDetails } from '@/lib/types';
import { generatePublicId } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { appInfo } from '@/config/app-config';
import useAlertDialog from '@/hooks/useAlertDialog';
import { getAxiosInstance } from '@/lib/axios-utils';
import { ROLES } from '@/lib/enums';
import AppContext from '@/store/AppContext';
import { useContext } from 'react';

const useOrgHelper = () => {
  const navigate = useNavigate();
  const dlg = useAlertDialog();
  const { activeOrg, loggedInUser } = useContext(AppContext);

  const editOrganization = (org: OrganizationType) => {
    if (!ROLES.Is_ADMIN(org.role_id)) {
      showWarningToast({
        header: 'Alert',
        description: (
          <>
            You are not allowed to edit the <b>{org.org_name}</b> {appInfo.account_type_txt.singular.toLocaleLowerCase()}.
          </>
        ),
      });
      return;
    }

    navigate('/infrastructure/edit-org/' + generatePublicId(org.org_id));
  };

  const handleOnDeleteUnregisteredUser = (user: Partial<TeamMembersDetails>, orgId: number) => {
    const { id, email } = user;

    return new Promise((resolve, reject) => {
      dlg.showAlertBox({
        type: 'CONFIRM',
        text: `Are you sure you want to remove "${email}" user from your ${appInfo.account_type_txt.singular}?`,
        async onClose(result) {
          if (result !== 'CONFIRM') {
            reject();
            return;
          }

          const reqData = {
            invited_users_id: id,
            org_id: orgId,
          };

          try {
            const result = await getAxiosInstance().delete('/org-member/unregistered-user-invitation', {
              data: reqData,
            });

            showSuccessToast({
              description: `${email} has been successfully removed from the team.`,
            });

            resolve(result);
          } catch (e) {
            reject(e);
          }
        },
      });
    });
  };

  const isActiveOrgCreatedByMe = () => {
    return Number(activeOrg?.org_created_by) === Number(loggedInUser.id);
  };

  return {
    editOrganization,
    handleOnDeleteUnregisteredUser,
    isActiveOrgCreatedByMe,
  };
};

export default useOrgHelper;
