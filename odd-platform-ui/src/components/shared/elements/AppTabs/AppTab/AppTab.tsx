import React from 'react';
import type { TabProps, TabsProps } from '@mui/material';
import { type TabType } from 'components/shared/elements/AppTabs/interfaces';
import { TabContainer } from 'components/shared/elements/AppTabs/AppTab/TabStyles';

export interface AppTabProps extends TabProps {
  type: TabType;
  $orientation?: TabsProps['orientation'];
}

const AppTab: React.FC<AppTabProps> = ({ type, hidden, $orientation, ...props }) => (
  <TabContainer
    {...props}
    disableRipple
    $type={type}
    $hidden={hidden}
    $orientation={$orientation}
  />
);

export default AppTab;
