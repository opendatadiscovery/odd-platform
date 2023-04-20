import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { AppSuspenseWrapper } from 'components/shared/elements';

const Overview = React.lazy(() => import('../Overview/Overview'));
const LinkedItemsList = React.lazy(
  () => import('../TermLinkedItemsList/LinkedItemsList')
);

const TermDetailsRoutes: React.FC = () => {
  const { TermsRoutes } = useAppPaths();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path={TermsRoutes.termsViewTypeParam}>
          <Route path={TermsRoutes.overview} element={<Overview />} />
          <Route path={TermsRoutes.linkedItems} element={<LinkedItemsList />} />
          <Route path='' element={<Navigate to={TermsRoutes.overview} />} />
        </Route>
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default TermDetailsRoutes;
