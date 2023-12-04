import React, { lazy } from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from '../shared/contexts';

const QueryExamplesContainer = lazy(() => import('./QueryExamplesContainer'));
const QueryExampleDetails = lazy(
  () => import('./QueryExampleDetails/QueryExampleDetailsContainer')
);

const DataModellingRoutes: React.FC = () => (
  <AppSuspenseWrapper>
    <Routes>
      <Route path='' element={<Navigate to='query-examples' />} />
      <Route
        path='query-examples'
        element={
          <WithPermissionsProvider
            allowedPermissions={[Permission.QUERY_EXAMPLE_CREATE]}
            resourcePermissions={[]}
            render={() => <QueryExamplesContainer />}
          />
        }
      />
      <Route
        path='query-examples/:queryExampleId'
        element={
          <WithPermissionsProvider
            allowedPermissions={[
              Permission.QUERY_EXAMPLE_UPDATE,
              Permission.QUERY_EXAMPLE_DELETE,
            ]}
            resourcePermissions={[]}
            render={() => <QueryExampleDetails />}
          />
        }
      />
    </Routes>
  </AppSuspenseWrapper>
);

export default DataModellingRoutes;
