import React from 'react';
import { Permission, PermissionResourceType } from 'generated-sources';

export interface PermissionContextProps {
  getIsAllowedTo: (resourceType?: PermissionResourceType, resourceId?: number) => boolean;
  getHasAccessTo: (
    resourceType?: PermissionResourceType,
    resourceId?: number
  ) => (to: Permission) => boolean;
}

const defaultBehaviour: PermissionContextProps = {
  getIsAllowedTo: () => false,
  getHasAccessTo: () => () => false,
};

const PermissionContext = React.createContext<PermissionContextProps>(defaultBehaviour);

export default PermissionContext;
