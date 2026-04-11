import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Permission, PermissionResourceType } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { useTermsRouteParams } from 'routes';
import { useResourcePermissions } from 'lib/hooks/api/permissions';

const Overview = lazy(() => import('../Overview/Overview'));
const LinkedEntitiesList = lazy(
  () => import('../TermLinkedEntitiesList/LinkedEntitiesList')
);
const LinkedTermsList = lazy(() => import('../TermLinkedTermsList/LinkedTermsList'));
const LinkedColumnsList = lazy(
  () => import('../TermLinkedColumnsList/LinkedColumnsList')
);
const TermQueryExamples = lazy(() => import('../TermQueryExamples/TermQueryExamples'));

const TermDetailsRoutes: React.FC = () => {
  const { termId } = useTermsRouteParams();
  const { data: resourcePermissions } = useResourcePermissions({
    resourceId: termId,
    permissionResourceType: PermissionResourceType.TERM,
  });

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path='overview' element={<Overview />} />
        <Route path='linked-entities' element={<LinkedEntitiesList />} />
        <Route path='linked-columns' element={<LinkedColumnsList />} />
        <Route path='linked-terms' element={<LinkedTermsList />} />
        <Route
          path='query-examples'
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.QUERY_EXAMPLE_TERM_CREATE,
                Permission.QUERY_EXAMPLE_TERM_DELETE,
              ]}
              resourcePermissions={resourcePermissions ?? []}
              Component={TermQueryExamples}
            />
          }
        />
        <Route path='' element={<Navigate to='overview' />} />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default TermDetailsRoutes;
