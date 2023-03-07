import React from 'react';
import { AppSuspenseWrapper } from 'components/shared';
import { Route, Routes } from 'react-router-dom-v5-compat';
import { useAppPaths } from 'lib/hooks';

const Overview = React.lazy(
  () => import('components/Terms/TermDetails/Overview/Overview')
);
const LinkedItemsList = React.lazy(
  () => import('components/Terms/TermDetails/TermLinkedItemsList/LinkedItemsList')
);

const TermDetailsRoutes: React.FC = () => {
  const { termDetailsLinkedItemsPath, termDetailsOverviewPath } = useAppPaths();

  return (
    <Routes>
      <Route
        path={termDetailsOverviewPath()}
        element={<AppSuspenseWrapper LazyComponent={Overview} />}
      />
      <Route
        path={termDetailsLinkedItemsPath()}
        element={<AppSuspenseWrapper LazyComponent={LinkedItemsList} />}
      />
    </Routes>
  );
};

export default TermDetailsRoutes;
