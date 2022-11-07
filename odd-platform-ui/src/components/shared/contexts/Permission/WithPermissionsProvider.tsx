import React from 'react';
import { Permission } from 'generated-sources';
import { PermissionProvider } from 'components/shared/contexts/index';

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
  ) : null;
};

export default WithPermissionsProvider;
