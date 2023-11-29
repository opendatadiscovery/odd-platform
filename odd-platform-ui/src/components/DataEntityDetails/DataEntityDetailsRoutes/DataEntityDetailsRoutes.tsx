import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper, RestrictedRoute } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsEntityStatusDeleted, getResourcePermissions } from 'redux/selectors';
import { DataEntitiesRoutes } from 'routes/dataEntitiesRoutes';

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

const DataEntityDetailsRoutes = () => {
  const { DataEntityRoutes, getNonExactParamPath } = useAppPaths();
  const { dataEntityId } = useAppParams();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path='' element={<Navigate to={DataEntitiesRoutes.OVERVIEW_PATH} />} />
        <Route path={DataEntitiesRoutes.OVERVIEW_PATH} element={<Overview />} />
        <Route path={DataEntitiesRoutes.STRUCTURE_PATH} element={<DatasetStructure />}>
          <Route path={getNonExactParamPath(DataEntityRoutes.structureViewTypeParam)}>
            <Route path={DataEntityRoutes.versionIdParam} />
          </Route>
        </Route>
        <Route
          path={DataEntitiesRoutes.LINEAGE_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
              component={Lineage}
            />
          }
        />
        <Route
          path={DataEntitiesRoutes.TEST_REPORTS_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
              component={TestReport}
            />
          }
        >
          <Route
            path={getNonExactParamPath(DataEntityRoutes.dataQATestIdParam)}
            element={<TestReportDetails />}
          >
            <Route
              path={getNonExactParamPath(DataEntityRoutes.testReportViewTypeParam)}
            />
          </Route>
        </Route>
        <Route
          path={DataEntitiesRoutes.ALERTS_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
            >
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
          path={DataEntitiesRoutes.HISTORY_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
              component={QualityTestHistory}
            />
          }
        />
        <Route
          path={DataEntitiesRoutes.LINKED_ENTITIES_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
              component={LinkedItemsList}
            />
          }
        />
        <Route path={DataEntityRoutes.activity} element={<DataEntityActivity />} />
        <Route
          path={getNonExactParamPath(DataEntitiesRoutes.DISCUSSIONS_PATH)}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
              component={DataCollaboration}
            />
          }
        >
          <Route path={DataEntityRoutes.messageIdParam} />
        </Route>
        <Route
          path={DataEntitiesRoutes.QUERY_EXAMPLES_PATH}
          element={
            <RestrictedRoute
              isAllowedTo={!isStatusDeleted}
              redirectTo={`../${DataEntitiesRoutes.OVERVIEW_PATH}`}
            >
              <WithPermissionsProvider
                allowedPermissions={[
                  Permission.QUERY_EXAMPLE_DATASET_CREATE,
                  Permission.QUERY_EXAMPLE_DATASET_DELETE,
                ]}
                resourcePermissions={[]}
                Component={DataEntityDetailsQueryExamples}
              />
            </RestrictedRoute>
          }
        />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DataEntityDetailsRoutes;
