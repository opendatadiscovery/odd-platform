import React, { SyntheticEvent } from 'react';
import { TabsProps } from '@mui/material';
import { Link } from 'react-router-dom';
import { TabType } from 'components/shared/AppTabs/interfaces';
import AppTab from 'components/shared/AppTabs/AppTab/AppTab';
import AppLinkTab from 'components/shared/AppTabs/AppTab/AppLinkTab';
import AppTabLabel from 'components/shared/AppTabs/AppTabLabel/AppTabLabel';
import { TabsContainer } from './AppTabsStyles';

export type AppTabItem<ValueT = number | string> = {
  name: string;
  link?: string;
  hint?: number | string;
  value?: ValueT;
  hidden?: boolean;
};

interface AppTabsProps
  extends Pick<TabsProps, 'value' | 'onChange' | 'orientation' | 'sx'> {
  items: AppTabItem[];
  handleTabChange: (newTab: number) => void;
  selectedTab?: number | boolean;
  type: TabType;
  isHintUpdated?: boolean;
}

const AppTabs: React.FC<AppTabsProps> = ({
  items,
  handleTabChange,
  selectedTab,
  type,
  orientation,
  isHintUpdated = false,
  sx,
}) => {
  const [currentTab, setCurrent] = React.useState<
    number | boolean | undefined
  >(selectedTab);

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setCurrent(newTab);
    handleTabChange(newTab);
  };

  React.useEffect(() => {
    setCurrent(selectedTab);
  }, [selectedTab]);

  return (
    <TabsContainer
      $type={type}
      value={currentTab}
      onChange={handleChange}
      variant="scrollable"
      orientation={orientation}
      scrollButtons="auto"
      sx={sx}
    >
      {items.map(item =>
        item.link ? (
          <AppLinkTab
            type={type}
            hidden={item.hidden}
            key={item.name}
            label={
              <AppTabLabel
                name={item.name}
                showHint={type === 'primary'}
                hint={item.hint}
                isHintUpdated={isHintUpdated}
              />
            }
            to={item.link}
            component={Link}
          />
        ) : (
          <AppTab
            type={type}
            hidden={item.hidden}
            key={item.name}
            label={
              <AppTabLabel
                name={item.name}
                showHint={type === 'primary'}
                hint={item.hint}
                isHintUpdated={isHintUpdated}
              />
            }
          />
        )
      )}
    </TabsContainer>
  );
};

export default AppTabs;
