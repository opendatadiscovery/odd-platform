import React from 'react';
import { Permission } from 'generated-sources';
import { PermissionProvider } from 'components/shared/contexts/index';

interface WithPermissionsProviderProps {
  permissions: Permission[];
  Component: React.FC;
}

const WithPermissionsProvider: React.FC<WithPermissionsProviderProps> = ({
  permissions,
  Component,
}) => (
  <PermissionProvider permissions={permissions}>
    <Component />
  </PermissionProvider>
);

export default WithPermissionsProvider;
