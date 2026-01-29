import DataTable from '@/components/custom/DataTable/DataTable';
import DialogWrapper from '@/components/custom/DialogWrapper';
import InfoButton from '@/components/custom/InfoButton';
import FlexColsLayout from '@/components/custom/Layouts/FlexColsLayout';
import { TypographyP } from '@/components/custom/Typography/TypographyP';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useAlertDialog from '@/hooks/useAlertDialog';
import { appInfo } from '@/config/app-config';
import { ROLES } from '@/lib/enums';
import { showErrorToast, showSuccessToast, showWarningToast } from '@/lib/toast-helper';
import type { EmailProcessingResult, TeamMembersDetails } from '@/lib/types';
import { isEmailValid, processEmailsWithValidation, INVITATION_ENUMS } from '@/lib/utils';
import AppContext from '@/store/AppContext';
import { Files, Pencil, Plus, Trash } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import RolesCmb from './RolesCmb';

interface IncludedUsersProps {
  teamMembers: TeamMembersDetails[];
  setTeamMembers: (teamMembers: TeamMembersDetails[]) => void;
  inactiveUsers: TeamMembersDetails[];
}

const canAllowEmailEdit = (record: TeamMembersDetails | undefined, editingRowId: string | number | undefined) => {
  return (
    editingRowId === -1 ||
    // record?.user_opinion === INVITATION_ENUMS.INVITED ||
    record?.user_opinion === INVITATION_ENUMS.NOT_SAVED
  );
};

const IncludedUsers = ({ teamMembers, setTeamMembers, inactiveUsers }: IncludedUsersProps) => {
  const [processedEmailsTextArea, setProcessedEmailsTextArea] = useState<EmailProcessingResult>();
  const [bulkRole, setBulkRole] = useState(NaN);

  const dlg = useAlertDialog();

  const [editingRowId, setEditingRowId] = useState<string | number | undefined>();
  const [isBulkWindowOpen, setIsBulkWindowOpen] = useState<boolean>(false);
  const [singleRecFields, setSingleRecFields] = useState<TeamMembersDetails>({
    email: '',
    role_id: ROLES.READ,
    user_opinion: INVITATION_ENUMS.INVITED,
    id: '',
  });
  const { loggedInUser } = useContext(AppContext);

  const addUniqueTeamMembers = (tMembers: TeamMembersDetails[]) => {
    const uniqueEmails: { [key: string]: number } = {};

    const newTeamMembers = [...(teamMembers ?? []), ...tMembers];
    newTeamMembers.forEach((tMemberRec) => {
      const emailKey = tMemberRec.email as string;

      uniqueEmails[emailKey] = uniqueEmails[emailKey] ? uniqueEmails[emailKey]++ : 1;
    });

    const result = newTeamMembers.filter((rec) => {
      uniqueEmails[rec.email]--;
      return uniqueEmails[rec.email] === 0;
    });

    setTeamMembers(result);

    return newTeamMembers.length === result.length;
  };

  const addBulkEmails = () => {
    const { validEmails } = processedEmailsTextArea || {};

    if (!validEmails?.length || validEmails?.length <= 0)
      return showWarningToast({
        description: 'Please add comma separated emails, then press Continue button',
      });

    const data = validEmails.map((email: string) => ({
      email,
      role_id: bulkRole,
      id: email,
      user_opinion: INVITATION_ENUMS.INVITED,
    }));

    addUniqueTeamMembers(data);
    setProcessedEmailsTextArea(undefined);
    setIsBulkWindowOpen(false);

    showSuccessToast({
      description: `${validEmails?.length} emails has been added.`,
    });
  };

  const validateFields = (rec: TeamMembersDetails) => {
    if (!rec || !rec.email || isEmailValid(rec.email) === false) {
      showErrorToast({
        description: `Invalid email, please enter correct email and try again.`,
      });
      return false;
    }

    if (!ROLES.IS_VALID_ROLE_ID(rec.role_id)) {
      showErrorToast({
        description: `Invalid role selected. Please select a valid role and try again.`,
      });
      return false;
    }

    return true;
  };

  const addNewTeamMember = () => {
    if (!validateFields(singleRecFields)) {
      return;
    }

    const isAdded = addUniqueTeamMembers([
      {
        ...singleRecFields,
        id: singleRecFields.email,
        user_opinion: INVITATION_ENUMS.NOT_SAVED,
      },
    ]);

    if (!isAdded) {
      showErrorToast({
        description: `This email is already exists in list: ${singleRecFields.email}`,
      });
      return;
    }

    setEditingRowId(undefined);
  };

  const updateTeamMember = () => {
    if (!validateFields(singleRecFields)) {
      return;
    }

    const recordWithSameEmail = teamMembers?.find((teamMemberRec) => {
      return teamMemberRec.email === singleRecFields.email && teamMemberRec.id !== editingRowId;
    });

    if (recordWithSameEmail) {
      showWarningToast({
        description: `This email is already exists in list: ${singleRecFields.email}`,
      });
      return;
    }

    const newTeamMembers = [...(teamMembers || [])];
    const record = newTeamMembers.find((teamMemberRec) => teamMemberRec.id === editingRowId);

    if (!record) {
      showErrorToast({ description: 'Record not found to update, something went wrong!' });
      return;
    }

    record.email = singleRecFields.email;
    record.role_id = singleRecFields.role_id;

    setTeamMembers(newTeamMembers);
    setEditingRowId(undefined);
  };

  useEffect(() => {
    if (!editingRowId) {
      setSingleRecFields({
        email: '',
        role_id: NaN,
        user_opinion: INVITATION_ENUMS.INVITED,
        id: '',
      });
      return;
    }

    if (editingRowId === -1) return;

    const rec = teamMembers?.find((teamMemberRec) => teamMemberRec.id === editingRowId);
    if (!rec) {
      showErrorToast({ description: 'Something went wrong, please reload and try again.' });
      return;
    }

    setSingleRecFields({
      email: rec.email,
      role_id: rec.role_id,
      user_opinion: rec.user_opinion,
      id: rec.id || rec.email,
    });
  }, [editingRowId]);

  return (
    <FlexColsLayout layout="vertical" className="gap-2">
      {isBulkWindowOpen && (
        <DialogWrapper
          open={true}
          setIsOpen={setIsBulkWindowOpen}
          header="Bulk Add Users"
          actionsJSX={<Button onClick={addBulkEmails}>Add users</Button>}
        >
          <FlexColsLayout layout="horizontal" className="gap-2">
            <Textarea
              id="includeUsers"
              placeholder="Enter comma separated emailIds like mail1@temp.com, mail2@temp.com"
              className="w-full min-h-[80px] max-h-[500px] mr-1"
              onChange={(e) => setProcessedEmailsTextArea(processEmailsWithValidation(e.target.value))}
            />
            <span>
              <InfoButton side="right">Enter comma separated emailIds like mail1@temp.com, mail2@temp.com</InfoButton>
            </span>
          </FlexColsLayout>
          <span className="mb-5">
            <span className="text-success">Valid Emails: {processedEmailsTextArea?.validEmails.length || 0}</span>,{' '}
            <span className="text-failure">Invalid Emails: {processedEmailsTextArea?.invalidEmails.length || 0}</span>
          </span>

          <div className="flex flex-row gap-2">
            {/* <Input
              type="checkbox"
              id="areAdmins"
              className="w-4"
              checked={areAdmins}
              onChange={(e) => setAreAdmins(e.target.checked)}
            /> */}
            <Label htmlFor="roles">Role *</Label>
            <RolesCmb
              id="bulk-roles"
              value={bulkRole?.toString() || ''}
              setValue={(newVal) => {
                setBulkRole(Number(newVal));
              }}
            />
          </div>
        </DialogWrapper>
      )}
      {editingRowId && (
        <DialogWrapper
          open={true}
          setIsOpen={(val) => {
            setEditingRowId(val === false ? undefined : editingRowId);
          }}
          header={editingRowId === -1 ? 'Add User' : 'Edit User'}
          actionsJSX={
            <Button type="button" onClick={editingRowId === -1 ? addNewTeamMember : updateTeamMember}>
              Update
            </Button>
          }
        >
          <div className="flex flex-col p-5 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={singleRecFields.email}
                disabled={canAllowEmailEdit(singleRecFields, editingRowId) === false}
                onChange={(e) =>
                  setSingleRecFields((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2 ">
              {/* <Input
                type="checkbox"
                id="isAdmin"
                className="w-4"
                checked={singleRecFields.isAdmin}
                onChange={(e) =>
                  setSingleRecFields((prev) => ({
                    ...prev,
                    isAdmin: e.target.checked,
                  }))
                }
              /> */}
              <Label htmlFor="roles">Role *</Label>
              <RolesCmb
                id="roles"
                value={singleRecFields.role_id?.toString() || ''}
                setValue={(newVal) => {
                  setSingleRecFields((prev) => ({
                    ...prev,
                    role_id: Number(newVal),
                  }));
                }}
              />
            </div>
          </div>
        </DialogWrapper>
      )}
      <DataTable
        canShowToolbar={true}
        canShowPagination={false}
        data={teamMembers || []}
        toolbarConfig={{
          canShowSearchField: false,
          canShowColumnsBtn: false,
          additionalJSX: [
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                // const newNode = {
                //   email: '',
                //   isAdmin: false,
                //   id: generateRandom4Digits().toString(),
                // };
                // setTeamMembers((prev) => [...(prev ?? []), newNode]);
                setEditingRowId(-1);
              }}
            >
              <Plus /> Add User
            </Button>,

            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsBulkWindowOpen(true);
              }}
            >
              <Files /> Bulk Add
            </Button>,
          ],
        }}
        columns={[
          {
            id: 'email',
            headerText: 'Email',
            enableSorting: false,
            enableHiding: false,
            editable: true,
          },
          {
            id: 'role_id',
            headerText: 'Role',
            enableSorting: false,
            enableHiding: false,
            editable: true,
            type: 'string',
            renderer(_, cellValue) {
              return ROLES.DISPLAY_TEXT(cellValue as number);
            },
          },
          {
            id: 'user_opinion',
            headerText: 'Status',
            enableSorting: false,
            enableHiding: false,
            type: 'boolean',
            editable: false,
            renderer(record: any) {
              const { user_opinion } = record.original;
              return INVITATION_ENUMS.getDisplay(user_opinion);
            },
          },
          {
            id: 'joinedOn',
            headerText: 'Joined On',
            enableSorting: false,
            enableHiding: false,
            type: 'date',
            editable: true,
          },
          {
            id: 'actions',
            headerText: 'Actions',
            enableSorting: false,
            enableHiding: false,
            renderer(record: any) {
              const { id: rowId } = record?.original;
              return (
                <>
                  <Button
                    variant={'ghost'}
                    onClick={() => {
                      const record = teamMembers?.find((record) => record.id === rowId);
                      const fullName = record?.fname || record?.lname ? `${record?.fname} ${record?.lname}` : record?.email;

                      if (record?.email === loggedInUser?.email) {
                        showWarningToast({
                          header: `Not allowed to edit "${fullName}"`,
                          description: `If you want to leave this ${appInfo.account_type_txt.singular.toLocaleLowerCase()}, go to "Manage ${
                            appInfo.account_type_txt.singular
                          }," open the actions menu (three dots), and click "Leave ${appInfo.account_type_txt.singular}."`,
                        });
                        return;
                      }

                      if (canAllowEmailEdit(record, undefined) === false) {
                        //showing just waring here..
                        showWarningToast({
                          header: `Not allowed to edit email "${fullName}", however you can update its administrative privileges.`,
                          description: `The invitation has been already sent. If you do not want this user as a team member, you can delete them and correct one.`,
                        });
                        // return;
                      }

                      setEditingRowId(rowId);
                    }}
                    type="button"
                  >
                    <Pencil />
                  </Button>

                  <Button
                    variant={'ghost'}
                    onClick={() => {
                      const record = teamMembers?.find((record) => record.id === rowId);
                      const fullName = record?.fname || record?.lname ? `${record?.fname} ${record?.lname}` : record?.email;

                      if (record?.email === loggedInUser?.email) {
                        showWarningToast({
                          header: `Not allowed to remove "${fullName}"`,
                          description: `If you want to leave this ${appInfo.account_type_txt.singular}, go to "Manage ${appInfo.account_type_txt.singular}," open the actions menu (three dots), and click "Leave ${appInfo.account_type_txt.singular}."`,
                        });
                        return;
                      }

                      dlg.showAlertBox({
                        type: 'CONFIRM',
                        text: `Are you sure you want to remove "${fullName}" user?`,
                        async onClose(result) {
                          if (result !== 'CONFIRM') {
                            return;
                          }

                          setTeamMembers(teamMembers?.filter((record) => record.id !== rowId));
                        },
                      });
                    }}
                    type="button"
                  >
                    <Trash />
                  </Button>
                </>
              );
            },
          },
        ]}
      />
      {inactiveUsers.length > 0 && (
        <>
          <TypographyP className={'mt-5 leading-normal font-semibold'}>Following users are inactive/deleted.</TypographyP>
          <ol>
            {inactiveUsers.map((user, index) => (
              <li key={user.email}>
                {index + 1}.&nbsp;
                {user.email}&nbsp;
                {ROLES.DISPLAY_TEXT(user.role_id)}
              </li>
            ))}
          </ol>
        </>
      )}
    </FlexColsLayout>
  );
};

export default IncludedUsers;
