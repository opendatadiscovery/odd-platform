import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  AppButton,
  AppLoadingPage,
  EntityClassItem,
  EntityTypeItem,
  LabelItem,
  SkeletonWrapper,
} from 'components/shared';
import { AddIcon, EditIcon, TimeGapIcon } from 'components/shared/Icons';
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
  getDataEntityDetailsFetchingStatuses,
  getDataEntityGroupUpdatingStatuses,
} from 'redux/selectors';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  PermissionProvider,
  WithPermissions,
  WithPermissionsProvider,
} from 'components/shared/contexts';
import DataEntityGroupControls from './DataEntityGroup/DataEntityGroupControls/DataEntityGroupControls';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import InternalNameFormDialog from './InternalNameFormDialog/InternalNameFormDialog';
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

const DataEntityDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const details = useAppSelector(getDataEntityDetails(dataEntityId));

  const { isLoaded: isDataEntityGroupUpdated } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );
  const { isLoading: isDataEntityDetailsFetching, isLoaded: isDataEntityDetailsFetched } =
    useAppSelector(getDataEntityDetailsFetchingStatuses);
  const { isLoaded: isDataEntityAddedToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );
  const { isLoaded: isDataEntityDeletedFromGroup } = useAppSelector(
    getDataEntityDeleteFromGroupStatuses
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [
    fetchDataEntityDetails,
    dataEntityId,
    isDataEntityGroupUpdated,
    isDataEntityAddedToGroup,
    isDataEntityDeletedFromGroup,
  ]);

  React.useEffect(() => {
    dispatch(fetchDataEntityAlerts({ dataEntityId }));
    dispatch(fetchDataSetQualityTestReport({ dataEntityId }));
    dispatch(fetchDataSetQualitySLAReport({ dataEntityId }));
    dispatch(
      fetchResourcePermissions({
        resourceId: dataEntityId,
        permissionResourceType: PermissionResourceType.DATA_ENTITY,
      })
    );
  }, [dataEntityId]);

  const originalName = React.useMemo(
    () =>
      details.internalName &&
      details.externalName && (
        <Grid container alignItems='center' width='auto'>
          <LabelItem labelName='Original' variant='body1' />
          <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
            {details.externalName}
          </Typography>
        </Grid>
      ),
    [details.internalName, details.externalName]
  );

  const updatedAt = React.useMemo(
    () =>
      details.updatedAt && (
        <>
          <TimeGapIcon />
          <Typography variant='body1' sx={{ ml: 1, whiteSpace: 'nowrap' }}>
            {formatDistanceToNowStrict(details.updatedAt, { addSuffix: true })}
          </Typography>
        </>
      ),
    [details.updatedAt]
  );

  return (
    <S.Container>
      {details.id && !isDataEntityDetailsFetching ? (
        <>
          <Grid container flexDirection='column' alignItems='flex-start'>
            <S.Caption container alignItems='center' flexWrap='nowrap'>
              <Grid container item lg={11} alignItems='center' flexWrap='nowrap'>
                <Typography variant='h1' noWrap sx={{ mr: 1 }}>
                  {details.internalName || details.externalName}
                </Typography>
                {details.entityClasses?.map(entityClass => (
                  <EntityClassItem
                    sx={{ ml: 0.5 }}
                    key={entityClass.id}
                    entityClassName={entityClass.name}
                  />
                ))}
                {details.type && (
                  <EntityTypeItem sx={{ ml: 1 }} entityTypeName={details.type.name} />
                )}
                <S.InternalNameEditBtnContainer>
                  <WithPermissions
                    resourceId={dataEntityId}
                    permissionTo={Permission.DATA_ENTITY_INTERNAL_NAME_UPDATE}
                  >
                    <InternalNameFormDialog
                      btnCreateEl={
                        <AppButton
                          size='small'
                          color='tertiary'
                          sx={{ ml: 1 }}
                          startIcon={details.internalName ? <EditIcon /> : <AddIcon />}
                        >
                          {`${details.internalName ? 'Edit custom' : 'Add custom'} name`}
                        </AppButton>
                      }
                    />
                  </WithPermissions>
                </S.InternalNameEditBtnContainer>
              </Grid>
              <Grid
                container
                item
                lg={1}
                sx={{ ml: 1 }}
                alignItems='center'
                flexWrap='nowrap'
              >
                {updatedAt}
                {details.manuallyCreated && (
                  <WithPermissionsProvider
                    permissions={[
                      Permission.DATA_ENTITY_GROUP_UPDATE,
                      Permission.DATA_ENTITY_GROUP_DELETE,
                    ]}
                    render={() => (
                      <DataEntityGroupControls
                        internalName={details.internalName}
                        externalName={details.externalName}
                      />
                    )}
                  />
                )}
              </Grid>
            </S.Caption>
            {originalName}
          </Grid>
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
                <PermissionProvider
                  permissions={[
                    Permission.DATASET_ENUMS_DELETE,
                    Permission.DATASET_ENUMS_UPDATE,
                    Permission.DATASET_LABELS_UPDATE,
                    Permission.DATASET_ENUMS_ADD,
                    Permission.DATASET_DESCRIPTION_UPDATE,
                  ]}
                >
                  <DatasetStructure />
                </PermissionProvider>
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
                <PermissionProvider permissions={[Permission.DATA_ENTITY_ALERT_RESOLVE]}>
                  <DataEntityAlerts />
                </PermissionProvider>
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
    </S.Container>
  );
};

export default DataEntityDetails;
