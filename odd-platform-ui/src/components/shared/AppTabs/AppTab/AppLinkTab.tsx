import React from 'react';
import { TabProps } from '@mui/material';
import { TabType } from 'components/shared/AppTabs/interfaces';
import { LinkProps } from 'react-router-dom';
import { LinkTabContainer } from 'components/shared/AppTabs/AppTab/TabStyles';

interface AppLinkTabProps
  extends Pick<LinkProps, 'to' | 'component'>,
    Pick<TabProps, 'key' | 'label' | 'hidden'> {
  type: TabType;
}

const AppLinkTab: React.FC<AppLinkTabProps> = ({
  type,
  hidden,
  ...props
}) => (
  <LinkTabContainer
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    $type={type}
    $hidden={hidden}
  />
);

export default AppLinkTab;
