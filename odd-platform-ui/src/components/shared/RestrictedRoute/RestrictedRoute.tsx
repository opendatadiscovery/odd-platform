import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

interface Props extends RouteProps {
  isAllowedTo: boolean;
  redirectTo: string;
}

const RestrictedRoute: React.FC<Props> = ({
  redirectTo,
  isAllowedTo,
  ...props
}) => {
  const redirect = React.useMemo(
    () => <Redirect to={redirectTo} />,
    [redirectTo]
  );
  const route = React.useMemo(() => <Route {...props} />, [props]);

  return isAllowedTo ? route : redirect;
};

export default RestrictedRoute;
