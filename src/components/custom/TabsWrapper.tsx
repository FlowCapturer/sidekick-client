import { TabsContent } from '@radix-ui/react-tabs';
import { Tabs, TabsList, TabsTrigger } from '../ui';

interface ITabsWrapperProps {
  tabs: {
    title: React.ReactNode;
    content: React.ReactNode;
    value: string;
  }[];
  variant?: 'default' | 'line';
  defaultValue?: string;
}
const TabsWrapper = ({ tabs, variant, defaultValue }: ITabsWrapperProps) => {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList variant={variant}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
export default TabsWrapper;
