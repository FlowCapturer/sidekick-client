import ListPanel from '@/components/custom/ListPanel';
import HeaderText from '@/components/custom/HeaderText';
import { Switch } from '@/components/ui/switch';
import ThemeCmb from './Components/ThemeCmb';
import { FlexColsLayout, LinkWrapper } from '@/components/custom';
import { appInfo } from '@/config/app-config';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useContext } from 'react';
import AppContext from '@/store/AppContext';

const GeneralSettingsPg = () => {
  const { featureFlags } = useContext(AppContext);
  return (
    <FlexColsLayout className="pr-5 pl-5">
      <div className="space-y-3">
        <HeaderText>Email Settings</HeaderText>
        {/* <ListPanel title="Marketing emails" description="Receive emails about new products, features, and more." control={<Switch />} /> */}
        <ListPanel title="Security emails" description="Receive emails about your account security." control={<Switch checked={true} disabled />} />
      </div>

      <div className="space-y-3 mt-4">
        <HeaderText>Theme</HeaderText>
        <ListPanel title="Specify theme" description="Choose your preferred theme to enhance your reading experience." control={<ThemeCmb />} />
      </div>

      {featureFlags?.ff_enable_teams && (
        <div className="space-y-3 mt-4">
          <HeaderText>
            <>{appInfo.account_type_txt.plural} Settings</>
          </HeaderText>

          <LinkWrapper to={'/infrastructure/manage-infra'}>
            <ListPanel
              title={`Manage ${appInfo.account_type_txt.plural}`}
              description={`Create and manage ${appInfo.account_type_txt.plural}, update ${appInfo.account_type_txt.singular} details, and invite members as needed.`}
              control={<SquareArrowOutUpRight />}
              labelCls="cursor-pointer"
            />
          </LinkWrapper>
          <LinkWrapper to={'/infrastructure/user-invitations'}>
            <ListPanel
              title={`Check Invitations`}
              description={`View and respond to ${appInfo.account_type_txt.singular} invitations you have received.`}
              control={<SquareArrowOutUpRight />}
              labelCls="cursor-pointer"
              className="mt-3"
            />
          </LinkWrapper>
        </div>
      )}
    </FlexColsLayout>
  );
};

export default GeneralSettingsPg;
