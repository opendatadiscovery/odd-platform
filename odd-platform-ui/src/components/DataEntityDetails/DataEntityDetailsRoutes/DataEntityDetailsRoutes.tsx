import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper, RestrictedRoute } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsEntityStatusDeleted, getResourcePermissions } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';

const Overview = lazy(() => import('../Overview/Overview'));
const DatasetStructure = lazy(() => import('../DatasetStructure/DatasetStructure'));
const Lineage = lazy(() => import('../Lineage/Lineage'));
const TestReport = lazy(() => import('../TestReport/TestReport'));
const TestReportDetails = lazy(
  () => import('../TestReport/TestReportDetails/TestReportDetails')
);
const DataEntityAlerts = lazy(() => import('../DataEntityAlerts/DataEntityAlerts'));
const QualityTestHistory = lazy(
  () => import('../QualityTestRunsHistory/TestRunsHistory')
);
const DataEntityActivity = lazy(() => import('../DataEntityActivity/DataEntityActivity'));
const DataCollaboration = lazy(() => import('../DataCollaboration/DataCollaboration'));
const LinkedItemsList = lazy(() => import('../LinkedItemsList/LinkedItemsList'));
const DataEntityDetailsQueryExamples = lazy(
  () => import('../DataEntityQueryExamples/DataEntityDetailsQueryExamples')
);
const DatasetData = lazy(() => import('../DatasetData/DatasetData'));
const DataEntityRelationships = lazy(
  () => import('../DataEntityRelationships/DataEntityRelationships')
);

const DataEntityDetailsRoutes = () => {
  const { dataEntityId } = useDataEntityRouteParams();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path='' element={<Navigate to='overview' />} />
        <Route path='overview' element={<Overview />} />
        <Route path='structure/*' element={<DatasetStructure />} />
        <Route
          path='lineage/*'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={Lineage}
            />
          }
        />
        <Route
          path='test-reports/*'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={TestReport}
            />
          }
        >
          <Route path=':dataQATestId/*' element={<TestReportDetails />}>
            <Route path=':testReportViewType' />
          </Route>
        </Route>
        <Route
          path='alerts'
          element={
            <RestrictedRoute isAllowedTo={!isStatusDeleted} redirectTo='../overview'>
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.DATA_ENTITY_ALERT_RESOLVE,
                  Permission.DATA_ENTITY_ALERT_CONFIG_UPDATE,
                ]}
                resourcePermissions={resourcePermissions}
                Component={DataEntityAlerts}
              />
            </RestrictedRoute>
          }
        />
        <Route
          path='history'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={QualityTestHistory}
            />
          }
        />
        <Route
          path='linked-entities'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={LinkedItemsList}
            />
          }
        />
        <Route path='activity' element={<DataEntityActivity />} />
        <Route
          path='discussions/*'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={DataCollaboration}
            />
          }
        >
          <Route path=':messageId' />
        </Route>
        <Route
          path='query-examples'
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.QUERY_EXAMPLE_DATASET_CREATE,
                Permission.QUERY_EXAMPLE_DATASET_DELETE,
              ]}
              resourcePermissions={resourcePermissions}
              Component={DataEntityDetailsQueryExamples}
            />
          }
        />
        <Route
          path='data'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={DatasetData}
            />
          }
        />
        <Route
          path='relationships'
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo='../overview'
              component={DataEntityRelationships}
            />
          }
        />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DataEntityDetailsRoutes;
