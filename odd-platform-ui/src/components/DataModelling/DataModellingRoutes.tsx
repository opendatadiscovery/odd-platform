import React, { lazy } from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';

const QueryExamplesContainer = lazy(() => import('./QueryExamplesContainer'));
const QueryExampleDetails = lazy(
  () => import('./QueryExampleDetails/QueryExampleDetails')
);

const DataModellingRoutes: React.FC = () => {
  const { DataModellingRoutes: routes } = useAppPaths();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path='/' element={<Navigate to={routes.queryExamples} />} />
        <Route path={routes.queryExamples} element={<QueryExamplesContainer />} />
        <Route path={routes.queryExamples}>
          <Route path={routes.queryExampleIdParam} element={<QueryExampleDetails />} />
        </Route>
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DataModellingRoutes;
