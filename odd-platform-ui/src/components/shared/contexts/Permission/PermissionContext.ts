import React from 'react';

export interface PermissionContextProps {
  getIsAllowedTo: (dataEntityId?: number) => boolean;
  isAdmin: boolean;
}

const defaultBehaviour: PermissionContextProps = {
  getIsAllowedTo: () => false,
  isAdmin: false,
};

const PermissionContext =
  React.createContext<PermissionContextProps>(defaultBehaviour);

export default PermissionContext;
