import BigSquare from '@/components/custom/BigSquare';
import { appInfo } from '@/config/app-config';
import AppContext from '@/store/AppContext';
import { useContext } from 'react';

const OrgSetup = () => {
  const { orgs } = useContext(AppContext);

  return (
    <div className="mt-5">
      <div className="flex flex-row justify-center gap-6">
        <BigSquare toPath={'create-new-org'} className="text-center">
          Create new {appInfo.account_type_txt.singular.toLocaleLowerCase()}
        </BigSquare>

        <BigSquare toPath={'user-invitations'} className="text-center">
          Accept/Reject Invitations
        </BigSquare>
      </div>
      <div className="flex flex-row justify-center gap-6 mt-5">
        <BigSquare toPath={'manage-infra'} className={'text-center'} disabled={orgs.length <= 0}>
          Manage {appInfo.account_type_txt.plural.toLocaleLowerCase()}
        </BigSquare>
      </div>
    </div>
  );
};

export default OrgSetup;
