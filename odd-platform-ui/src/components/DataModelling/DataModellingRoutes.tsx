import React, { lazy } from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DataModellingRoutes as routes } from 'routes/dataModellingRoutes';

const QueryExamplesContainer = lazy(() => import('./QueryExamplesContainer'));
const QueryExampleDetails = lazy(
  () => import('./QueryExampleDetails/QueryExampleDetailsContainer')
);

const DataModellingRoutes: React.FC = () => (
  <AppSuspenseWrapper>
    <Routes>
      <Route path='/' element={<Navigate to={routes.QUERY_EXAMPLES_PATH} />} />
      <Route path={routes.QUERY_EXAMPLES_PATH} element={<QueryExamplesContainer />} />
      <Route path={routes.QUERY_EXAMPLES_PATH}>
        <Route path={routes.QUERY_EXAMPLE_PATH} element={<QueryExampleDetails />} />
      </Route>
    </Routes>
  </AppSuspenseWrapper>
);

export default DataModellingRoutes;
