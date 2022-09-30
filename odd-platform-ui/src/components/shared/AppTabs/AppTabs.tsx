import React, { SyntheticEvent } from 'react';
import { TabsProps } from '@mui/material';
import { Link } from 'react-router-dom';
import { HintType, TabType } from 'components/shared/AppTabs/interfaces';
import AppTab from 'components/shared/AppTabs/AppTab/AppTab';
import AppLinkTab from 'components/shared/AppTabs/AppTab/AppLinkTab';
import AppTabLabel from 'components/shared/AppTabs/AppTabLabel/AppTabLabel';
import { TabsContainer } from './AppTabsStyles';

export type AppTabItem<ValueT = number | string | boolean> = {
  name: string;
  link?: string;
  hint?: number | string;
  hintType?: HintType;
  value?: ValueT;
  hidden?: boolean;
};

interface AppTabsProps
  extends Pick<TabsProps, 'value' | 'onChange' | 'orientation' | 'sx'> {
  items: AppTabItem[];
  handleTabChange: (newTab: number) => void;
  selectedTab?: number | boolean;
  type: TabType;
  isHintUpdating?: boolean;
}

const AppTabs: React.FC<AppTabsProps> = ({
  items,
  handleTabChange,
  selectedTab,
  type,
  orientation,
  isHintUpdating = false,
  sx,
}) => {
  const selectedTabState = selectedTab === -1 ? false : selectedTab;
  const [currentTab, setCurrent] = React.useState<number | boolean | undefined>(
    selectedTabState
  );

  const handleChange = (event: SyntheticEvent, newTab: number) => {
    setCurrent(newTab);
    handleTabChange(newTab);
  };

  React.useEffect(() => {
    setCurrent(selectedTabState);
  }, [selectedTab]);
  return (
    <TabsContainer
      $type={type}
      value={currentTab}
      onChange={handleChange}
      variant='scrollable'
      orientation={orientation}
      scrollButtons='auto'
      sx={sx}
    >
      {items.map(item => {
        const getHintLength = (): number => {
          if (typeof item.hint === 'string') return item.hint.length;
          if (typeof item.hint === 'number') return item.hint;
          return 0;
        };

        const setHintShowed = (): boolean => {
          if (getHintLength() === 0 && item.hintType === 'alert') return false;
          return type === 'primary';
        };

        return item.link ? (
          <AppLinkTab
            $orientation={orientation}
            type={type}
            hidden={item.hidden}
            key={item.name}
            label={
              <AppTabLabel
                name={item.name}
                showHint={setHintShowed()}
                hint={item.hint}
                isHintUpdating={isHintUpdating}
                hintType={item.hintType}
              />
            }
            to={item.link}
            component={Link}
          />
        ) : (
          <AppTab
            $orientation={orientation}
            type={type}
            hidden={item.hidden}
            key={item.name}
            label={
              <AppTabLabel
                name={item.name}
                showHint={setHintShowed()}
                hint={item.hint}
                isHintUpdating={isHintUpdating}
                hintType={item.hintType}
              />
            }
          />
        );
      })}
    </TabsContainer>
  );
};

export default AppTabs;
