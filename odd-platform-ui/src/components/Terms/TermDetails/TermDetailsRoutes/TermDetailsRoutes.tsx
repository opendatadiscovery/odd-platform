import React from 'react';
import { Route, Routes } from 'react-router-dom-v5-compat';
import { useAppPaths } from 'lib/hooks';

const Overview = React.lazy(() => import('../Overview/Overview'));
const LinkedItemsList = React.lazy(
  () => import('../TermLinkedItemsList/LinkedItemsList')
);

const TermDetailsRoutes: React.FC = () => {
  const { termDetailsLinkedItemsPath, termDetailsOverviewPath } = useAppPaths();

  return (
    <Routes>
      <Route path={termDetailsOverviewPath()} element={<Overview />} />
      <Route path={termDetailsLinkedItemsPath()} element={<LinkedItemsList />} />
    </Routes>
  );
};

export default TermDetailsRoutes;
