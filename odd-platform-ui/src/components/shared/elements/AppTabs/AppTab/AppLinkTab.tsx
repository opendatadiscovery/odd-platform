import React from 'react';
import type { TabProps, TabsProps } from '@mui/material';
import type { TabType } from 'components/shared/elements/AppTabs/interfaces';
import type { LinkProps } from 'react-router-dom';
import { LinkTabContainer } from 'components/shared/elements/AppTabs/AppTab/TabStyles';

interface AppLinkTabProps extends TabProps {
  type: TabType;
  $orientation?: TabsProps['orientation'];
  to: LinkProps['to'];
  component: React.ComponentType<any>;
}

const AppLinkTab: React.FC<AppLinkTabProps> = ({
  type,
  hidden,
  $orientation,
  ...props
}) => (
  <LinkTabContainer
    {...props}
    disableRipple
    $type={type}
    $hidden={hidden}
    $orientation={$orientation}
  />
);
export default AppLinkTab;
