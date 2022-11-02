import React from 'react';
import { Permission, PermissionResourceType } from 'generated-sources';
import { getGlobalPermissions, getResourcePermissions } from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import PermissionContext, { PermissionContextProps } from './PermissionContext';

interface PermissionProviderProps {
  permissions: Permission[];
}

const getPermissions = (resourceType?: PermissionResourceType, resourceId?: number) =>
  resourceType && resourceId
    ? useAppSelector(getResourcePermissions(resourceType, resourceId))
    : [];

const PermissionProvider: React.FunctionComponent<PermissionProviderProps> = ({
  permissions,
  children,
}) => {
  const globalPermissions = useAppSelector(getGlobalPermissions);

  const getIsAllowedTo = React.useCallback(
    (resourceType?: PermissionResourceType, resourceId?: number) =>
      permissions.every(perm =>
        [...globalPermissions, ...getPermissions(resourceType, resourceId)].includes(perm)
      ),
    [permissions, getPermissions, globalPermissions]
  );

  const getHasAccessTo = React.useCallback(
    (resourceType?: PermissionResourceType, resourceId?: number) => (to: Permission) =>
      [...globalPermissions, ...getPermissions(resourceType, resourceId)].includes(to) &&
      permissions.includes(to),
    [permissions, getPermissions, globalPermissions]
  );

  const providerValue = React.useMemo<PermissionContextProps>(
    () => ({ getIsAllowedTo, getHasAccessTo }),
    [getIsAllowedTo, getHasAccessTo]
  );

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
