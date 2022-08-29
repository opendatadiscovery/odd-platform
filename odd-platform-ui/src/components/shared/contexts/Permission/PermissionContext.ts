import React from 'react';

export interface PermissionContextProps {
  isAllowedTo: boolean;
  isAdmin: boolean;
}

const defaultBehaviour: PermissionContextProps = {
  isAllowedTo: false,
  isAdmin: false,
};

const PermissionContext =
  React.createContext<PermissionContextProps>(defaultBehaviour);

export default PermissionContext;
