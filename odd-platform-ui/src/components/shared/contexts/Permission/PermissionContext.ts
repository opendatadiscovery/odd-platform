import React from 'react';

interface PermissionContextProps {
  isAllowedTo: boolean;
}

const defaultBehaviour: PermissionContextProps = {
  isAllowedTo: false,
};

const PermissionContext =
  React.createContext<PermissionContextProps>(defaultBehaviour);

export default PermissionContext;
