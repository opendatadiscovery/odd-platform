import React from 'react';
import { PermissionResourceType } from 'generated-sources';
import { usePermissions } from 'lib/hooks';

interface WithPermissionsProps {
  resourceId?: number;
  resourceType?: PermissionResourceType;
  renderContent: ({ isAllowedTo }: { isAllowedTo: boolean }) => JSX.Element;
}

const WithPermissions: React.FC<WithPermissionsProps> = ({
  resourceId,
  resourceType = PermissionResourceType.DATA_ENTITY,
  renderContent,
}) => {
  const { isAllowedTo } = usePermissions({ resourceId, resourceType });

  return <>{renderContent({ isAllowedTo })}</>;
};

export default WithPermissions;
