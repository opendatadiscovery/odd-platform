import React, { lazy } from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from '../shared/contexts';

const QueryExamples = lazy(() => import('./QueryExamples'));
const QueryExampleDetails = lazy(
  () => import('./QueryExampleDetails/QueryExampleDetailsContainer')
);
const Relationships = lazy(() => import('./Relationships'));

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
            render={() => <QueryExamples />}
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
      <Route path='relationships' element={<Relationships />} />
    </Routes>
  </AppSuspenseWrapper>
);

export default DataModellingRoutes;
