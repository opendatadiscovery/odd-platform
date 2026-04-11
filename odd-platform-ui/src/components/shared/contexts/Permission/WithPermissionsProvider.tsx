import React from 'react';
import type { Permission } from 'generated-sources';
import PermissionProvider from './PermissionProvider';

interface WithPermissionsProviderProps extends React.PropsWithChildren {
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
  children,
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

  if (Component) {
    return (
      <PermissionProvider
        resourcePermissions={resourcePermissions}
        allowedPermissions={allowedPermissions}
      >
        <Component />
      </PermissionProvider>
    );
  }

  return (
    <PermissionProvider
      resourcePermissions={resourcePermissions}
      allowedPermissions={allowedPermissions}
    >
      {children}
    </PermissionProvider>
  );
};

export default WithPermissionsProvider;
