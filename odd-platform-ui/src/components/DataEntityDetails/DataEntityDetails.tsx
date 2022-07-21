import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  dataEntityActivityPath,
  dataEntityAlertsPath,
  dataEntityHistoryPath,
  dataEntityLineagePath,
  dataEntityLinkedItemsPath,
  dataEntityOverviewPath,
  dataEntityTestReportPath,
  datasetStructurePath,
  searchPath,
} from 'lib/paths';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import TimeGapIcon from 'components/shared/Icons/TimeGapIcon';
import InternalNameFormDialogContainer from 'components/DataEntityDetails/InternalNameFormDialog/InternalNameFormDialogContainer';
import AddIcon from 'components/shared/Icons/AddIcon';
import EditIcon from 'components/shared/Icons/EditIcon';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import DataEntityDetailsSkeleton from 'components/DataEntityDetails/DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import AppButton from 'components/shared/AppButton/AppButton';
import AppLoadingPage from 'components/shared/AppLoadingPage/AppLoadingPage';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { useAppParams } from 'lib/hooks/hooks';
import {
  deleteDataEntityGroup,
  fetchDataEntityAlerts,
  fetchDataEntityDetails,
  fetchDataSetQualityTestReport,
} from 'redux/thunks';
import {
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatus,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors/dataentity.selectors';
import { getDatasetTestReport } from 'redux/selectors/dataQualityTest.selectors';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import AppPopover from 'components/shared/AppPopover/AppPopover';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityDeleteFromGroupStatuses,
  getDataEntityGroupUpdatingStatuses,
  getDataEntityOpenAlertsCount,
  getSearchId,
} from 'redux/selectors';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import DataEntityGroupForm from './DataEntityGroupForm/DataEntityGroupForm';
import LinkedItemsListContainer from './LinkedItemsList/LinkedItemsListContainer';
import * as S from './DataEntityDetailsStyles';

// lazy components
const Overview = React.lazy(() => import('./Overview/Overview'));
const DatasetStructureContainer = React.lazy(
  () => import('./DatasetStructure/DatasetStructureContainer')
);
const Lineage = React.lazy(() => import('./Lineage/Lineage'));
const TestReport = React.lazy(() => import('./TestReport/TestReport'));
const TestReportDetails = React.lazy(
  () => import('./TestReport/TestReportDetails/TestReportDetails')
);
const DataEntityAlerts = React.lazy(
  () => import('./DataEntityAlerts/DataEntityAlerts')
);
const QualityTestHistory = React.lazy(
  () => import('./QualityTestRunsHistory/TestRunsHistory')
);
const DataEntityActivity = React.lazy(
  () => import('./DataEntityActivity/DataEntityActivity')
);

const DataEntityDetailsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId, viewType } = useAppParams();
  const { isLoaded: isDataEntityGroupUpdated } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );

  const openAlertsCount = useAppSelector(getDataEntityOpenAlertsCount);
  const dataEntityDetails = useAppSelector(state =>
    getDataEntityDetails(state, dataEntityId)
  );
  const { isDataset, isQualityTest, isTransformer } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );
  const datasetQualityTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );
  const dataEntityFetchingStatus = useAppSelector(
    getDataEntityDetailsFetchingStatus
  );
  const { isLoaded: isDataEntityAddedToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );

  const { isLoaded: isDataEntityDeletedFromGroup } = useAppSelector(
    getDataEntityDeleteFromGroupStatuses
  );

  const searchId = useAppSelector(getSearchId);

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
  }, [dataEntityId]);

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'Overview',
        link: dataEntityOverviewPath(dataEntityId),
        value: 'overview',
      },
      {
        name: 'Structure',
        link: datasetStructurePath(dataEntityId),
        hidden: !isDataset,
        value: 'structure',
      },
      {
        name: 'Lineage',
        link: dataEntityLineagePath(dataEntityId),
        hidden: isQualityTest,
        value: 'lineage',
      },
      {
        name: 'Test reports',
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReport?.total,
        value: 'test-reports',
      },
      {
        name: 'History',
        link: dataEntityHistoryPath(dataEntityId),
        hidden: !isQualityTest && !isTransformer,
        value: 'history',
      },
      {
        name: 'Alerts',
        link: dataEntityAlertsPath(dataEntityId),
        value: 'alerts',
        hint: openAlertsCount,
        hintType: 'alert',
      },
      {
        name: 'Linked items',
        link: dataEntityLinkedItemsPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren,
        value: 'linked-items',
      },
      {
        name: 'Activity',
        link: dataEntityActivityPath(dataEntityId),
        value: 'activity',
      },
    ]);
  }, [
    dataEntityId,
    isQualityTest,
    isDataset,
    dataEntityDetails,
    openAlertsCount,
    datasetQualityTestReport?.total,
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
    );
  }, [tabs, viewType]);

  const handleEntityGroupDelete = React.useCallback(
    () =>
      dispatch(
        deleteDataEntityGroup({ dataEntityGroupId: dataEntityId })
      ).then(() => history.push(searchPath(searchId))),
    [deleteDataEntityGroup, dataEntityId]
  );

  return (
    <S.Container>
      {dataEntityDetails && dataEntityFetchingStatus !== 'fetching' ? (
        <>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            wrap="nowrap"
          >
            <S.Caption item>
              <Grid container item alignItems="center">
                <Typography variant="h1" noWrap sx={{ mr: 1 }}>
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
                  <InternalNameFormDialogContainer
                    dataEntityId={dataEntityId}
                    btnCreateEl={
                      <AppButton
                        size="small"
                        color="tertiary"
                        sx={{ ml: 1 }}
                        startIcon={
                          dataEntityDetails.internalName ? (
                            <EditIcon />
                          ) : (
                            <AddIcon />
                          )
                        }
                      >
                        {`${
                          dataEntityDetails.internalName
                            ? 'Edit'
                            : 'Add custom'
                        } name`}
                      </AppButton>
                    }
                  />
                </S.InternalNameEditBtnContainer>
              </Grid>
              {dataEntityDetails.internalName &&
                dataEntityDetails.externalName && (
                  <Grid container alignItems="center">
                    <LabelItem labelName="Original" variant="body1" />
                    <Typography variant="body1" sx={{ ml: 0.5 }} noWrap>
                      {dataEntityDetails.externalName}
                    </Typography>
                  </Grid>
                )}
            </S.Caption>
            <Grid container item alignItems="center" width="auto">
              {dataEntityDetails.updatedAt ? (
                <>
                  <TimeGapIcon />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {formatDistanceToNowStrict(
                      dataEntityDetails.updatedAt,
                      {
                        addSuffix: true,
                      }
                    )}
                  </Typography>
                </>
              ) : null}
              <Grid>
                {dataEntityDetails.manuallyCreated && (
                  <AppPopover
                    renderOpenBtn={({ onClick, ariaDescribedBy }) => (
                      <AppIconButton
                        sx={{ ml: 2 }}
                        ariaDescribedBy={ariaDescribedBy}
                        size="medium"
                        color="primaryLight"
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
                      actionTitle="Are you sure you want to delete this data entity group?"
                      actionName="Delete Data Entity Group"
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
          </Grid>
          <Grid sx={{ mt: 2 }}>
            {tabs.length && selectedTab >= 0 ? (
              <AppTabs
                type="primary"
                items={tabs}
                selectedTab={selectedTab}
                handleTabChange={() => {}}
              />
            ) : null}
          </Grid>
        </>
      ) : null}
      {dataEntityFetchingStatus === 'fetching' ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <DataEntityDetailsSkeleton
              width={randomSkeletonPercentWidth()}
            />
          )}
        />
      ) : null}
      {dataEntityFetchingStatus !== 'errorFetching' ? (
        <React.Suspense fallback={<AppLoadingPage />}>
          <Switch>
            <Route
              exact
              path="/dataentities/:dataEntityId/overview"
              component={Overview}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/structure/:versionId?"
              component={DatasetStructureContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/lineage"
              component={Lineage}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?"
              component={TestReport}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/test-reports/:dataQATestId?/:viewType?"
              component={TestReportDetails}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/alerts"
              component={DataEntityAlerts}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/history"
              component={QualityTestHistory}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/linked-items"
              component={LinkedItemsListContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/activity"
              component={DataEntityActivity}
            />
            <Redirect
              from="/dataentities/:dataEntityId"
              to="/dataentities/:dataEntityId/overview"
            />
          </Switch>
        </React.Suspense>
      ) : null}
      <AppErrorPage fetchStatus={dataEntityFetchingStatus} />
    </S.Container>
  );
};

export default DataEntityDetailsView;
