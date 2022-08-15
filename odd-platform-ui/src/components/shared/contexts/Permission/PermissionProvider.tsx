import React, { useMemo } from 'react';
import { Permission } from 'generated-sources';
import { getUserPermissions } from 'redux/selectors';
import { useAppSelector } from 'lib/redux/hooks';
import PermissionContext from './PermissionContext';

interface PermissionProviderProps {
  permissions: Permission[];
}

const PermissionProvider: React.FunctionComponent<
  PermissionProviderProps
> = ({ permissions, children }) => {
  const userPermissions = useAppSelector(getUserPermissions);

  const providerValue = useMemo(() => {
    const isAllowedTo = permissions.every(perm =>
      userPermissions.includes(perm)
    );

    return { isAllowedTo };
  }, [permissions, userPermissions]);

  return (
    <PermissionContext.Provider value={providerValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
