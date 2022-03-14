import React from 'react';
import { TabProps, TabsProps } from '@mui/material';
import { TabType } from 'components/shared/AppTabs/interfaces';
import { LinkProps } from 'react-router-dom';
import { LinkTabContainer } from 'components/shared/AppTabs/AppTab/TabStyles';

interface AppLinkTabProps
  extends Pick<LinkProps, 'to' | 'component'>,
    Pick<TabProps, 'key' | 'label' | 'hidden'> {
  type: TabType;
  $orientation?: TabsProps['orientation'];
}

const AppLinkTab: React.FC<AppLinkTabProps> = ({
  type,
  hidden,
  $orientation,
  ...props
}) => (
  <LinkTabContainer
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    disableRipple
    $type={type}
    $hidden={hidden}
    $orientation={$orientation}
  />
);

export default AppLinkTab;
