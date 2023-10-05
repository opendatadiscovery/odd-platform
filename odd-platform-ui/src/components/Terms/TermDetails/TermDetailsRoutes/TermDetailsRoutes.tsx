import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { AppSuspenseWrapper } from 'components/shared/elements';

const Overview = lazy(() => import('../Overview/Overview'));
const LinkedEntitiesList = lazy(
  () => import('../TermLinkedEntitiesList/LinkedEntitiesList')
);

const TermDetailsRoutes: React.FC = () => {
  const { TermsRoutes } = useAppPaths();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path={TermsRoutes.termsViewTypeParam}>
          <Route path='' element={<Navigate to={TermsRoutes.overview} />} />
          <Route path={TermsRoutes.overview} element={<Overview />} />
          <Route path={TermsRoutes.linkedEntities} element={<LinkedEntitiesList />} />
          <Route path={TermsRoutes.linkedColumns} element={<LinkedEntitiesList />} />
        </Route>
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default TermDetailsRoutes;
