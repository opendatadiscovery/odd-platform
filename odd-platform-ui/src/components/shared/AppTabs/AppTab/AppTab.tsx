import React from 'react';
import { TabProps } from '@mui/material';
import { TabType } from 'components/shared/AppTabs/interfaces';
import { TabContainer } from 'components/shared/AppTabs/AppTab/TabStyles';

export interface AppTabProps extends TabProps {
  type: TabType;
}

const AppTab: React.FC<AppTabProps> = ({ type, hidden, ...props }) => (
  <TabContainer
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    $type={type}
    $hidden={hidden}
  />
);

export default AppTab;
