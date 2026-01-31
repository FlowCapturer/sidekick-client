import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import TabularLayout from '@/components/custom/Layouts/TabularLayout';
import { TypographyHeading } from '@/components/custom/Typography/TypographyHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFormDataByFormEl, isObjectEmpty, isTruthyValue, isValidId, undoPublicId } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { Label } from '@radix-ui/react-label';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import IncludedUsers from './components/IncludedUsers';
import type { OrganizationType, OrganizationTypeResponse, responseTeamMembersInf, TeamMembersDetails } from '@/lib/types';
import { getAxiosInstance } from '@/lib/axios-utils';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { APP_INFO_ACCOUNT_TYPE, appInfo } from '@/config/app-config';
import { ROLES } from '@/lib/enums';
import { TypographyP } from '@/components/custom/Typography/TypographyP';
import { Trash } from 'lucide-react';
import useOrgHelper from './hooks/useOrgHelper';
import { Separator } from '@/components/ui/separator';
import PremiumIcon from '../Subscriptions/components/PremiumIcon';

const CreateOrg = () => {
  const navigate = useNavigate();

  const { orgId = '' } = useParams();
  const [id, setId] = useState<number>(() => {
    return orgId ? undoPublicId(parseInt(orgId, 10)) : -1;
  });

  const [canShowTeamMembers, setCanShowTeamMembers] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMembersDetails[]>([]);
  const [unregisteredUsers, setUnregisteredUsers] = useState<Partial<TeamMembersDetails>[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<TeamMembersDetails[]>([]);
  const [areTeamMembersLoading, setAreTeamMembersLoading] = useState<boolean | string>(false);
  const initializedTeamMembers = useRef<TeamMembersDetails[]>([]);
  const [unregisteredUserLoading, setUnregisteredUsersLoading] = useState<boolean>();

  const { orgs, setOrgs, loggedInUser } = useContext(AppContext);
  const orgRecord = id > -1 ? orgs.find((rec) => rec.org_id === id) : null;
  const isEditMode = id > -1 || orgRecord;

  const { handleOnDeleteUnregisteredUser } = useOrgHelper();

  useEffect(() => {
    if (!isEditMode) return;

    const convertServerToLocalFields = (members: responseTeamMembersInf[]) => {
      return members.map((rec) => ({
        id: rec.user_id,
        email: rec.user_email,
        role_id: rec.role_id,
        user_opinion: rec.user_opinion,
        fname: rec.user_fname,
        lname: rec.user_lname,
        joinedOn: rec.joined_on,
      }));
    };

    const fetchTeamMembers = async () => {
      setAreTeamMembersLoading('Fetching Team Members');
      try {
        const responseTeamMembers: {
          orgMembers: responseTeamMembersInf[];
          unregisteredUsers: Partial<responseTeamMembersInf>[];
        } = await getAxiosInstance().get(`org-member/${id}`);

        const orgMembers = responseTeamMembers.orgMembers.filter((rec) => isTruthyValue(rec.is_active));

        const tMembers: TeamMembersDetails[] = convertServerToLocalFields(orgMembers);

        const unregistered = responseTeamMembers.unregisteredUsers.map((rec) => ({
          role_id: rec.role_id,
          email: rec.email,
          id: rec.invited_users_id,
        }));

        const inactiveUsers_deleted = responseTeamMembers.orgMembers.filter((rec) => !isTruthyValue(rec.is_active));

        setTeamMembers(tMembers);
        setCanShowTeamMembers(true);
        setUnregisteredUsers(unregistered);
        setInactiveUsers(convertServerToLocalFields(inactiveUsers_deleted));
        initializedTeamMembers.current = structuredClone(tMembers);
      } finally {
        setAreTeamMembersLoading(false);
      }
    };

    fetchTeamMembers();
  }, [isEditMode, id]);

  const putData = (newRecord: OrganizationType) => {
    const reqData: Partial<OrganizationType> = {},
      oldData = orgRecord;

    if (newRecord.org_name !== oldData?.org_name && newRecord.org_name) {
      reqData.org_name = newRecord.org_name;
    }
    if (newRecord.org_address !== oldData?.org_address && newRecord.org_address) {
      reqData.org_address = newRecord.org_address;
    }
    if (newRecord.org_state !== oldData?.org_state && newRecord.org_state) {
      reqData.org_state = newRecord.org_state;
    }
    if (newRecord.org_country !== oldData?.org_country && newRecord.org_country) {
      reqData.org_country = newRecord.org_country;
    }
    if (newRecord.org_external_id !== oldData?.org_external_id && newRecord.org_external_id) {
      reqData.org_external_id = newRecord.org_external_id;
    }

    if (isObjectEmpty(reqData)) {
      return;
    }

    return getAxiosInstance().put(`/organization/${orgRecord?.org_id}`, reqData);
  };

  const postData = async (newRecord: OrganizationType) => {
    const reqData = {
      org_name: newRecord.org_name,
      org_address: newRecord.org_address,
      org_state: newRecord.org_state,
      org_country: newRecord.org_country,
      org_external_id: newRecord.org_external_id,
    };

    return getAxiosInstance().post(`/organization`, reqData);
  };

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAreTeamMembersLoading('Saving...');

    try {
      let orgId = orgRecord?.org_id;

      const data = getFormDataByFormEl(event.currentTarget) as unknown as OrganizationType;
      // console.log('old orgData:', orgRecord);
      // console.log('new orgData:', data);
      if (isEditMode) {
        //if error, then below code will not execute.
        await putData(data);
      } else {
        const res = (await postData(data)) as unknown as { insertedOrgId: string };
        orgId = parseInt(res.insertedOrgId, 10);

        if (isValidId(orgId) === false) {
          showErrorToast({
            description: `No response received from the ${appInfo.account_type_txt.singular.toLocaleLowerCase()} service. Returning to the Manage ${
              appInfo.account_type_txt.singular
            } page.`,
          });
          setTimeout(() => {
            navigate('/infrastructure/manage-infra');
          }, 1000);
        }
      }

      const handleSuccess = (isTeamMemberAdded: boolean) => {
        showSuccessToast({
          description: `${appInfo.account_type_txt.singular} has been ${isEditMode ? 'updated' : 'created'} successfully.${
            isTeamMemberAdded ? ' Team members have also been updated successfully and sent invitation emails.' : ''
          }`,
        });

        navigate('/infrastructure/manage-infra');
      };

      if (!canShowTeamMembers) return handleSuccess(false);

      try {
        const initialValues = initializedTeamMembers.current;
        // console.log('original: ', initializedTeamMembers.current);
        // console.log('new', teamMembers);

        const needToRemoveTeamMembers = initialValues.filter((rec) => !teamMembers.find((teamMemberRec) => rec.email === teamMemberRec.email));
        // console.log('needToRemoveTeamMembers', needToRemoveTeamMembers);
        if (needToRemoveTeamMembers && needToRemoveTeamMembers.length > 0) {
          const reqParams = {
            org_id: orgId,
            users: needToRemoveTeamMembers.map((rec) => ({
              user_id: rec.id,
              // is_admin: rec.isAdmin,
            })),
          };

          await getAxiosInstance().delete('/org-member', { data: reqParams });
        }

        const needToUpdate = teamMembers.filter((rec) => {
          const tMemberRec = initialValues.find((teamMemberRec) => rec.id === teamMemberRec.id);

          if (!tMemberRec) return false; //here means, this record might be deleted.
          if (tMemberRec.role_id === rec.role_id) return false; //nothing has changed.

          return true;
        });

        // console.log('needToUpdate', needToUpdate);
        if (needToUpdate && needToUpdate.length > 0) {
          const reqParams = {
            org_id: orgId,
            users: needToUpdate.map((rec) => ({
              user_id: rec.id,
              role_id: rec.role_id,
            })),
          };

          await getAxiosInstance().put('/org-member', reqParams);
        }

        const needToNewAddTeamMembers = teamMembers.filter((teamMemberRec) => !initialValues.find((rec) => rec.email === teamMemberRec.email));
        if (needToNewAddTeamMembers && needToNewAddTeamMembers.length > 0) {
          const reqParams = {
            org_id: orgId,
            included_users: needToNewAddTeamMembers.map((rec) => ({
              email: rec.email,
              role_id: rec.role_id,
            })),
          };

          await getAxiosInstance().post('/org-member/by-emails', reqParams);
        }
        // console.log('needToNewAddTeamMembers', needToNewAddTeamMembers);

        handleSuccess(true);
      } finally {
        setId(orgId || -1);
      }
    } finally {
      setAreTeamMembersLoading(false);
      const orgsRes = (await getAxiosInstance().get('organization')) as OrganizationTypeResponse;
      setOrgs(orgsRes?.orgs || []);
    }
  };

  const defaultOrgName = isEditMode
    ? orgRecord?.org_name
    : `${loggedInUser?.fname}'s ${appInfo.account_type_txt.singular} ${orgs.length >= 1 ? orgs.length + 1 : ''}`;

  return (
    <FlexColsLayout className="pb-5 sm:px-0 px-5 pt-5">
      <FlexColsLayout layout="horizontal">
        <span className="md:flex-1 flex-none"></span>
        <FlexColsLayout className="flex-4 max-w-4xl pr-5 sm:pl-0 pl-2 overflow-visible">
          <TypographyHeading className="text-center pl-5 gap-1">
            <span className="inline-flex items-center gap-2">
              {isEditMode
                ? `Editing "${orgRecord?.org_name}" ${appInfo.account_type_txt.singular}`
                : `Create new ${appInfo.account_type_txt.singular}`}
              {isEditMode && orgRecord?.active_purchased_plan ? <PremiumIcon purchasedPlan={orgRecord?.active_purchased_plan} /> : null}
            </span>
          </TypographyHeading>

          <form onSubmit={handleOnSubmit}>
            <TabularLayout
              className="w-full pr-1 mt-2 text-sm"
              leftCls="w-32 sm:w-36 md:w-40 w-full sm:w-40 text-left sm:text-right pr-0 sm:pr-2 pt-3 sm:pt-7"
              rightCls="pt-1 sm:pt-5"
              rowCls="flex-col sm:flex-row"
              child={[
                <Label htmlFor="orgName" className="font-medium">
                  {appInfo.account_type_txt.singular} Name * :
                </Label>,
                <Input
                  id="orgName"
                  name="org_name"
                  type="text"
                  required
                  className="w-full"
                  defaultValue={orgRecord?.org_name ?? defaultOrgName}
                  autoFocus
                />,

                ...(appInfo.account_type_txt.value === APP_INFO_ACCOUNT_TYPE.ORG
                  ? [
                      <Label htmlFor="address" className="font-medium">
                        Address * :
                      </Label>,
                      <Input id="address" name="org_address" type="text" required className="w-full" defaultValue={orgRecord?.org_address ?? ''} />,

                      <Label htmlFor="state" className="font-medium">
                        State * :
                      </Label>,
                      <Input id="state" name="org_state" type="text" required className="w-full" defaultValue={orgRecord?.org_state ?? ''} />,
                      <Label htmlFor="country" className="font-medium">
                        Country * :
                      </Label>,
                      <Input id="country" name="org_country" type="text" required className="w-full" defaultValue={orgRecord?.org_country ?? ''} />,
                    ]
                  : []),

                <Label htmlFor="org_external_id" className="font-medium">
                  External Id (optional) :
                </Label>,
                <Input id="org_external_id" name="org_external_id" type="text" className="w-full" defaultValue={orgRecord?.org_external_id ?? ''} />,

                <></>,
                <FlexColsLayout layout="horizontal">
                  <Input
                    id="doIncludeUsers"
                    type="checkbox"
                    className="w-4"
                    checked={canShowTeamMembers}
                    onChange={(e) => setCanShowTeamMembers(e.target.checked)}
                  />
                  <Label htmlFor="doIncludeUsers" className="font-medium mt-2 ml-1">
                    Would you like to invite your team members in this {appInfo.account_type_txt.singular}?
                  </Label>
                </FlexColsLayout>,
                ...(canShowTeamMembers
                  ? [
                      <Label htmlFor="includeUsers" className="font-medium">
                        Team Members:
                      </Label>,

                      <IncludedUsers teamMembers={teamMembers} setTeamMembers={setTeamMembers} inactiveUsers={inactiveUsers} />,
                    ]
                  : []),

                <></>,
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 sm:flex-none" loading={!!areTeamMembersLoading}>
                    {areTeamMembersLoading ? areTeamMembersLoading : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  {/* <Button type="reset" variant="outline" className="flex-1 sm:flex-none">
                    Reset
                  </Button> */}
                </div>,
                <></>,
                <></>,

                <></>,
                <>{unregisteredUsers.length > 0 && <Separator />}</>,

                <>{unregisteredUsers.length > 0 && 'Unregistered Users:'}</>,
                <>
                  {unregisteredUsers.length > 0 && (
                    <FlexColsLayout loading={unregisteredUserLoading}>
                      <TypographyP className={'mt-2 leading-normal font-semibold'}>
                        Following users are unregistered. We have sent them invitation emails; once they accept, they will be part of this{' '}
                        {appInfo.account_type_txt.singular.toLocaleLowerCase()}.
                      </TypographyP>
                      <ol>
                        {unregisteredUsers.map((user, index) => (
                          <li key={user.email} className="mt-1">
                            <span className="inline-flex group">
                              <span>
                                {index + 1}.&nbsp;
                                {user.email}, (role: &nbsp;
                                {ROLES.DISPLAY_TEXT(user.role_id as number)})
                              </span>
                              {/* <span title="Edit">
                                <Pencil
                                  size={'15px'}
                                  className="opacity-40 group-hover:opacity-60 hover:opacity-100 ml-1 mt-0.5 cursor-pointer"
                                  onClick={() => console.log('123')}
                                />
                              </span> */}
                              <span title="Delete">
                                <Trash
                                  size={'15px'}
                                  className="opacity-40 group-hover:opacity-60 hover:opacity-100 ml-1 mt-0.5 cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      setUnregisteredUsersLoading(true);
                                      await handleOnDeleteUnregisteredUser(user, id);

                                      const copyUsers = [...unregisteredUsers];
                                      copyUsers.splice(index, 1);
                                      setUnregisteredUsers(copyUsers);
                                    } finally {
                                      setUnregisteredUsersLoading(false);
                                    }
                                  }}
                                />
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </FlexColsLayout>
                  )}
                </>,
              ]}
            />
          </form>
        </FlexColsLayout>
        <span className="md:flex-1 flex-none"></span>
      </FlexColsLayout>
    </FlexColsLayout>
  );
};

export default CreateOrg;
