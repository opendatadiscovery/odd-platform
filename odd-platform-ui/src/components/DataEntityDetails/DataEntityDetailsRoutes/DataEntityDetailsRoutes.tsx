import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper, RestrictedRoute } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsEntityStatusDeleted, getResourcePermissions } from 'redux/selectors';

const Overview = React.lazy(() => import('../Overview/Overview'));
const DatasetStructure = React.lazy(() => import('../DatasetStructure/DatasetStructure'));
const Lineage = React.lazy(() => import('../Lineage/Lineage'));
const TestReport = React.lazy(() => import('../TestReport/TestReport'));
const TestReportDetails = React.lazy(
  () => import('../TestReport/TestReportDetails/TestReportDetails')
);
const DataEntityAlerts = React.lazy(() => import('../DataEntityAlerts/DataEntityAlerts'));
const QualityTestHistory = React.lazy(
  () => import('../QualityTestRunsHistory/TestRunsHistory')
);
const DataEntityActivity = React.lazy(
  () => import('../DataEntityActivity/DataEntityActivity')
);
const DataCollaboration = React.lazy(
  () => import('../DataCollaboration/DataCollaboration')
);
const LinkedItemsList = React.lazy(() => import('../LinkedItemsList/LinkedItemsList'));

const DataEntityDetailsRoutes: React.FC = () => {
  const { DataEntityRoutes, getNonExactParamPath } = useAppPaths();
  const { dataEntityId } = useAppParams();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path={DataEntityRoutes.dataEntityViewTypeParam}>
          <Route path={DataEntityRoutes.overview} element={<Overview />} />
          <Route
            path={getNonExactParamPath(DataEntityRoutes.structure)}
            element={<DatasetStructure />}
          >
            <Route path={getNonExactParamPath(DataEntityRoutes.structureViewTypeParam)}>
              <Route path={DataEntityRoutes.versionIdParam} />
            </Route>
          </Route>
          <Route
            path={DataEntityRoutes.lineage}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
                component={Lineage}
              />
            }
          />
          <Route
            path={getNonExactParamPath(DataEntityRoutes.testReports)}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
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
            path={DataEntityRoutes.alerts}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
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
            path={DataEntityRoutes.history}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
                component={QualityTestHistory}
              />
            }
          />
          <Route
            path={DataEntityRoutes.linkedItems}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
                component={LinkedItemsList}
              />
            }
          />
          <Route path={DataEntityRoutes.activity} element={<DataEntityActivity />} />
          <Route
            path={getNonExactParamPath(DataEntityRoutes.discussions)}
            element={
              <RestrictedRoute
                isAllowedTo={!isStatusDeleted}
                redirectTo={`../${DataEntityRoutes.overview}`}
                component={DataCollaboration}
              />
            }
          >
            <Route path={DataEntityRoutes.messageIdParam} />
          </Route>
          <Route path='' element={<Navigate to={DataEntityRoutes.overview} />} />
        </Route>
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DataEntityDetailsRoutes;
