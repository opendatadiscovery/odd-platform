import React from 'react';
import { Permission } from 'generated-sources';
import { PermissionProvider } from 'components/shared/contexts/index';

interface WithPermissionsProviderProps {
  permissions: Permission[];
  Component?: React.FC;
  render?: () => JSX.Element;
}

const WithPermissionsProvider: React.FC<WithPermissionsProviderProps> = ({
  permissions,
  Component,
  render,
}) => {
  if (render) {
    return <PermissionProvider permissions={permissions}>{render()}</PermissionProvider>;
  }

  return Component ? (
    <PermissionProvider permissions={permissions}>
      <Component />
    </PermissionProvider>
  ) : null;
};

export default WithPermissionsProvider;
