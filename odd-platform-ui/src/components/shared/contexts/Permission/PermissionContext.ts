import React from 'react';
import type { Permission } from 'generated-sources';

export interface PermissionContextProps {
  isAllowedTo: boolean;
  getHasAccessTo: (to: Permission) => boolean;
}

const defaultBehaviour: PermissionContextProps = {
  isAllowedTo: false,
  getHasAccessTo: () => false,
};

const PermissionContext = React.createContext<PermissionContextProps>(defaultBehaviour);

export default PermissionContext;
