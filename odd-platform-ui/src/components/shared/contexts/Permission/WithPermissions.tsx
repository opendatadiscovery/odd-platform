import React from 'react';
import type { Permission } from 'generated-sources';
import { usePermissions } from 'lib/hooks';

interface WithPermissionsProps extends React.PropsWithChildren {
  permissionTo: Permission;
  extraCheck?: boolean;
  renderContent?: ({ isAllowedTo }: { isAllowedTo: boolean }) => JSX.Element | null;
}

const WithPermissions: React.FC<WithPermissionsProps> = ({
  permissionTo,
  renderContent,
  extraCheck,
  children,
}) => {
  const { hasAccessTo } = usePermissions();

  if (renderContent) {
    return <>{renderContent({ isAllowedTo: hasAccessTo(permissionTo) })}</>;
  }

  if (children && extraCheck !== undefined) {
    return hasAccessTo(permissionTo) && extraCheck ? <>{children}</> : null;
  }

  if (children) {
    return hasAccessTo(permissionTo) ? <>{children}</> : null;
  }

  return null;
};

export default WithPermissions;
