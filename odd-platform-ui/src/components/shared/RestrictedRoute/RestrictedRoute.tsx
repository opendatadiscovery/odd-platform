import React from 'react';
import { Redirect, Route, type RouteProps } from 'react-router-dom';

interface Props extends RouteProps {
  isAllowedTo: boolean;
  redirectTo: string;
}

const RestrictedRoute: React.FC<Props> = ({ redirectTo, isAllowedTo, ...props }) =>
  isAllowedTo ? <Route {...props} /> : <Redirect to={redirectTo} />;

export default RestrictedRoute;
