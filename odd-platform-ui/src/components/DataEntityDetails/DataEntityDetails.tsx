import { Grid } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppErrorPage, AppLoadingPage, SkeletonWrapper } from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  fetchDataEntityAlertsCounts,
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
import { AlertStatus, Permission, PermissionResourceType } from 'generated-sources';
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
  const {
    dataEntityDetailsPath,
    datasetStructurePath,
    dataEntityLineagePath,
    dataEntityActivityPath,
    dataEntityAlertsPath,
    dataEntityOverviewPath,
    dataEntityCollaborationMessagePath,
    dataEntityCollaborationCreateMessagePath,
    dataEntityTestPath,
    dataEntityHistoryPath,
    dataEntityCollaborationPath,
    dataEntityLinkedItemsPath,
  } = useAppPaths();

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

  React.useEffect(() => {
    dispatch(fetchDataEntityAlertsCounts({ dataEntityId, status: AlertStatus.OPEN }));
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
            <Route exact path={dataEntityOverviewPath()} component={Overview} />
            <Route
              exact
              path={datasetStructurePath()}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[
                    Permission.DATASET_FIELD_ENUMS_UPDATE,
                    Permission.DATASET_FIELD_LABELS_UPDATE,
                    Permission.DATASET_FIELD_DESCRIPTION_UPDATE,
                  ]}
                  resourcePermissions={resourcePermissions}
                  Component={DatasetStructure}
                />
              )}
            />
            <Route exact path={dataEntityLineagePath()} component={Lineage} />
            <Route exact path={dataEntityTestPath()} component={TestReport} />
            <Route exact path={dataEntityTestPath()} component={TestReportDetails} />
            <Route
              exact
              path={dataEntityAlertsPath()}
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
            <Route exact path={dataEntityHistoryPath()} component={QualityTestHistory} />
            <Route exact path={dataEntityLinkedItemsPath()} component={LinkedItemsList} />
            <Route exact path={dataEntityActivityPath()} component={DataEntityActivity} />
            <Route
              exact
              path={[
                dataEntityCollaborationPath(),
                dataEntityCollaborationMessagePath(),
                dataEntityCollaborationCreateMessagePath(),
              ]}
              component={DataCollaboration}
            />
            <Redirect from={dataEntityDetailsPath()} to={dataEntityOverviewPath()} />
          </Switch>
        </React.Suspense>
      ) : null}
      <AppErrorPage
        showError={isDataEntityDetailsNotFetched}
        error={dataEntityDetailsFetchingError}
      />
    </S.Container>
  );
};

export default DataEntityDetails;
