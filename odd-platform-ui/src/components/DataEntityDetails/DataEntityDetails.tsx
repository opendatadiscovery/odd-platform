import { Grid } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppErrorPage, AppLoadingPage, SkeletonWrapper } from 'components/shared';
import { useAppParams } from 'lib/hooks';
import {
  fetchDataEntityAlerts,
  fetchDataEntityDetails,
  fetchDataSetQualitySLAReport,
  fetchDataSetQualityTestReport,
  fetchResourcePermissions,
} from 'redux/thunks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityDeleteFromGroupStatuses,
  getDataEntityDetails,
  getDataEntityDetailsFetchingError,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getResourcePermissions,
} from 'redux/selectors';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import DataEntityDetailsHeader from './DataEntityDetailsHeader/DataEntityDetailsHeader';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import LinkedItemsList from './LinkedItemsList/LinkedItemsList';
import * as S from './DataEntityDetailsStyles';
import DataEntityDetailsTabs from './DataEntityDetailsTabs/DataEntityDetailsTabs';

// lazy components
const Overview = React.lazy(() => import('./Overview/Overview'));
const DatasetStructure = React.lazy(() => import('./DatasetStructure/DatasetStructure'));
const Lineage = React.lazy(() => import('./Lineage/Lineage'));
const TestReport = React.lazy(() => import('./TestReport/TestReport'));
const TestReportDetails = React.lazy(
  () => import('./TestReport/TestReportDetails/TestReportDetails')
);
const DataEntityAlerts = React.lazy(() => import('./DataEntityAlerts/DataEntityAlerts'));
const QualityTestHistory = React.lazy(
  () => import('./QualityTestRunsHistory/TestRunsHistory')
);
const DataEntityActivity = React.lazy(
  () => import('./DataEntityActivity/DataEntityActivity')
);
const DataCollaboration = React.lazy(
  () => import('./DataCollaboration/DataCollaboration')
);

const DataEntityDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const details = useAppSelector(getDataEntityDetails(dataEntityId));
  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  const { isLoaded: isDataEntityGroupUpdated } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );
  const {
    isLoading: isDataEntityDetailsFetching,
    isLoaded: isDataEntityDetailsFetched,
    isNotLoaded: isDataEntityDetailsNotFetched,
  } = useAppSelector(getDataEntityDetailsFetchingStatuses);
  const dataEntityDetailsFetchingError = useAppSelector(
    getDataEntityDetailsFetchingError
  );
  const { isLoaded: isDataEntityAddedToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );
  const { isLoaded: isDataEntityDeletedFromGroup } = useAppSelector(
    getDataEntityDeleteFromGroupStatuses
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [
    dataEntityId,
    isDataEntityGroupUpdated,
    isDataEntityAddedToGroup,
    isDataEntityDeletedFromGroup,
  ]);

  const [page, size] = [1, 30];

  React.useEffect(() => {
    dispatch(fetchDataEntityAlerts({ dataEntityId, page, size }));
    dispatch(fetchDataSetQualityTestReport({ dataEntityId }));
    dispatch(fetchDataSetQualitySLAReport({ dataEntityId }));
    dispatch(
      fetchResourcePermissions({
        resourceId: dataEntityId,
        permissionResourceType: PermissionResourceType.DATA_ENTITY,
      })
    );
  }, [dataEntityId]);

  return (
    <S.Container>
      {details.id && !isDataEntityDetailsFetching ? (
        <>
          <WithPermissionsProvider
            allowedPermissions={[
              Permission.DATA_ENTITY_INTERNAL_NAME_UPDATE,
              Permission.DATA_ENTITY_GROUP_UPDATE,
              Permission.DATA_ENTITY_GROUP_DELETE,
            ]}
            resourcePermissions={resourcePermissions}
            render={() => (
              <DataEntityDetailsHeader
                dataEntityId={dataEntityId}
                internalName={details.internalName}
                externalName={details.externalName}
                entityClasses={details.entityClasses}
                type={details.type}
                manuallyCreated={details.manuallyCreated}
                updatedAt={details.updatedAt}
              />
            )}
          />
          <Grid sx={{ mt: 2 }}>
            <DataEntityDetailsTabs />
          </Grid>
        </>
      ) : null}
      {isDataEntityDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <DataEntityDetailsSkeleton width={randWidth()} />
          )}
        />
      ) : null}
      {isDataEntityDetailsFetched ? (
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/overview',
                '/embedded/dataentities/:dataEntityId/overview',
              ]}
              component={Overview}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/structure/:versionId?',
                '/embedded/dataentities/:dataEntityId/structure/:versionId?',
              ]}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.DATASET_FIELD_ENUMS_UPDATE,
                    Permission.DATASET_FIELD_INFO_UPDATE,
                  ]}
                  resourcePermissions={resourcePermissions}
                  Component={DatasetStructure}
                />
              )}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/lineage',
                '/embedded/dataentities/:dataEntityId/lineage',
              ]}
              component={Lineage}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?',
                '/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?',
              ]}
              component={TestReport}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?',
                '/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?',
              ]}
              component={TestReportDetails}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/alerts',
                '/embedded/dataentities/:dataEntityId/alerts',
              ]}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.DATA_ENTITY_ALERT_RESOLVE,
                    Permission.DATA_ENTITY_ALERT_CONFIG_UPDATE,
                  ]}
                  resourcePermissions={resourcePermissions}
                  Component={DataEntityAlerts}
                />
              )}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/history',
                '/embedded/dataentities/:dataEntityId/history',
              ]}
              component={QualityTestHistory}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/linked-items',
                '/embedded/dataentities/:dataEntityId/linked-items',
              ]}
              component={LinkedItemsList}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/activity',
                '/embedded/dataentities/:dataEntityId/activity',
              ]}
              component={DataEntityActivity}
            />
            <Route
              exact
              path={[
                '/dataentities/:dataEntityId/collaboration',
                '/dataentities/:dataEntityId/collaboration/createMessage',
                '/dataentities/:dataEntityId/collaboration/:messageId',
              ]}
              component={DataCollaboration}
            />
            <Redirect
              from='/dataentities/:dataEntityId'
              to='/dataentities/:dataEntityId/overview'
            />
            <Redirect
              from='/embedded/dataentities/:dataEntityId'
              to='/embedded/dataentities/:dataEntityId/overview'
            />
          </Switch>
        </React.Suspense>
      ) : null}
      <AppErrorPage
        isNotContentLoaded={isDataEntityDetailsNotFetched}
        error={dataEntityDetailsFetchingError}
      />
    </S.Container>
  );
};

export default DataEntityDetails;
