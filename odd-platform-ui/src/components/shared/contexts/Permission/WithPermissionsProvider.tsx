import React from 'react';
import type { Permission } from 'generated-sources';
import PermissionProvider from './PermissionProvider';

interface WithPermissionsProviderProps {
  allowedPermissions: Permission[];
  resourcePermissions: Permission[];
  Component?: React.FC;
  render?: () => JSX.Element;
}

const WithPermissionsProvider: React.FC<WithPermissionsProviderProps> = ({
  allowedPermissions,
  resourcePermissions,
  Component,
  render,
}) => {
  if (render) {
    return (
      <PermissionProvider
        resourcePermissions={resourcePermissions}
        allowedPermissions={allowedPermissions}
      >
        {render()}
      </PermissionProvider>
    );
  }

  return Component ? (
    <PermissionProvider
      resourcePermissions={resourcePermissions}
      allowedPermissions={allowedPermissions}
    >
      <Component />
    </PermissionProvider>
  ) : (
    <div>zalupa</div>
  );
};

export default WithPermissionsProvider;
