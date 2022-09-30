import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  AppButton,
  AppIconButton,
  AppLoadingPage,
  AppMenuItem,
  AppPopover,
  ConfirmationDialog,
  EntityClassItem,
  EntityTypeItem,
  LabelItem,
  SkeletonWrapper,
} from 'components/shared';
import { AddIcon, EditIcon, KebabIcon, TimeGapIcon } from 'components/shared/Icons';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import {
  deleteDataEntityGroup,
  fetchDataEntityAlerts,
  fetchDataEntityDetails,
  fetchDataSetQualitySLAReport,
  fetchDataEntityPermissions,
  fetchDataSetQualityTestReport,
} from 'redux/thunks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityDeleteFromGroupStatuses,
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getSearchId,
} from 'redux/selectors';
import { Permission } from 'generated-sources';
import { PermissionProvider } from 'components/shared/contexts';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import InternalNameFormDialog from './InternalNameFormDialog/InternalNameFormDialog';
import DataEntityGroupForm from './DataEntityGroupForm/DataEntityGroupForm';
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
  const history = useHistory();
  const { dataEntityId } = useAppParams();
  const { isAllowedTo: editDataEntity } = usePermissions({ dataEntityId });
  const { searchPath } = useAppPaths();

  const searchId = useAppSelector(getSearchId);
  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));

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
    dispatch(fetchDataEntityPermissions({ dataEntityId }));
  }, [dataEntityId]);

  const handleEntityGroupDelete = React.useCallback(
    () =>
      dispatch(deleteDataEntityGroup({ dataEntityGroupId: dataEntityId })).then(() =>
        history.push(searchPath(searchId))
      ),
    [deleteDataEntityGroup, dataEntityId]
  );

  return (
    <S.Container>
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
        <>
          <Grid container flexDirection='column' alignItems='flex-start'>
            <S.Caption container alignItems='center' flexWrap='nowrap'>
              <Grid container item lg={11} alignItems='center' flexWrap='nowrap'>
                <Typography variant='h1' noWrap sx={{ mr: 1 }}>
                  {dataEntityDetails.internalName
                    ? dataEntityDetails.internalName
                    : dataEntityDetails.externalName}
                </Typography>
                {dataEntityDetails.entityClasses?.map(entityClass => (
                  <EntityClassItem
                    sx={{ ml: 0.5 }}
                    key={entityClass.id}
                    entityClassName={entityClass.name}
                  />
                ))}
                {dataEntityDetails.type && (
                  <EntityTypeItem
                    sx={{ ml: 1 }}
                    entityTypeName={dataEntityDetails.type.name}
                  />
                )}
                <S.InternalNameEditBtnContainer>
                  <InternalNameFormDialog
                    btnCreateEl={
                      <AppButton
                        size='small'
                        color='tertiary'
                        sx={{ ml: 1 }}
                        disabled={!editDataEntity}
                        startIcon={
                          dataEntityDetails.internalName ? <EditIcon /> : <AddIcon />
                        }
                      >
                        {`${
                          dataEntityDetails.internalName ? 'Edit custom' : 'Add custom'
                        } name`}
                      </AppButton>
                    }
                  />
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
                {dataEntityDetails.updatedAt ? (
                  <>
                    <TimeGapIcon />
                    <Typography variant='body1' sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                      {formatDistanceToNowStrict(dataEntityDetails.updatedAt, {
                        addSuffix: true,
                      })}
                    </Typography>
                  </>
                ) : null}
                <Grid>
                  {dataEntityDetails.manuallyCreated && (
                    <AppPopover
                      childrenSx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                      renderOpenBtn={({ onClick, ariaDescribedBy }) => (
                        <AppIconButton
                          sx={{ ml: 2 }}
                          ariaDescribedBy={ariaDescribedBy}
                          size='medium'
                          color='primaryLight'
                          icon={<KebabIcon />}
                          onClick={onClick}
                        />
                      )}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 65,
                      }}
                    >
                      <DataEntityGroupForm
                        btnCreateEl={<AppMenuItem>Edit</AppMenuItem>}
                      />
                      <ConfirmationDialog
                        actionTitle='Are you sure you want to delete this data entity group?'
                        actionName='Delete Data Entity Group'
                        actionText={
                          <>
                            &quot;
                            {dataEntityDetails.internalName ||
                              dataEntityDetails.externalName}
                            &quot; will be deleted permanently.
                          </>
                        }
                        onConfirm={handleEntityGroupDelete}
                        actionBtn={<AppMenuItem>Delete</AppMenuItem>}
                      />
                    </AppPopover>
                  )}
                </Grid>
              </Grid>
            </S.Caption>

            {dataEntityDetails.internalName && dataEntityDetails.externalName && (
              <Grid container alignItems='center' width='auto'>
                <LabelItem labelName='Original' variant='body1' />
                <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
                  {dataEntityDetails.externalName}
                </Typography>
              </Grid>
            )}
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
              component={DatasetStructure}
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
                <PermissionProvider permissions={[Permission.ALERT_PROCESSING]}>
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
