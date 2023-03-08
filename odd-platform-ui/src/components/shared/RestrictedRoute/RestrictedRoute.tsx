import React from 'react';
import { Navigate } from 'react-router-dom-v5-compat';

interface Props {
  isAllowedTo: boolean;
  redirectTo: string;
  component?: React.FC;
}

const RestrictedRoute: React.FC<Props> = ({
  redirectTo,
  isAllowedTo,
  component: Component,
  children,
}) => {
  if (!isAllowedTo) return <Navigate to={redirectTo} replace />;

  if (Component) return <Component />;

  return <>{children}</>;
};

export default RestrictedRoute;
