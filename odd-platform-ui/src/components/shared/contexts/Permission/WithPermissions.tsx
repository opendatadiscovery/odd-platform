import React from 'react';
import { Permission, PermissionResourceType } from 'generated-sources';
import { usePermissions } from 'lib/hooks';

interface WithPermissionsProps {
  permissionTo: Permission;
  extraCheck?: boolean;
  resourceId?: number;
  resourceType?: PermissionResourceType;
  renderContent?: ({ isAllowedTo }: { isAllowedTo: boolean }) => JSX.Element | null;
}

const WithPermissions: React.FC<WithPermissionsProps> = ({
  permissionTo,
  resourceId,
  resourceType = PermissionResourceType.DATA_ENTITY,
  renderContent,
  extraCheck,
  children,
}) => {
  const { isAllowedTo, hasAccessTo } = usePermissions({ resourceId, resourceType });

  if (renderContent) {
    return <>{renderContent({ isAllowedTo })}</>;
  }

  if (children && permissionTo && extraCheck !== undefined) {
    return hasAccessTo(permissionTo) && extraCheck ? <>{children}</> : null;
  }

  if (children && permissionTo) {
    return hasAccessTo(permissionTo) ? <>{children}</> : null;
  }

  return null;
};

export default WithPermissions;
