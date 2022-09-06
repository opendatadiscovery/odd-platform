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
  AppTabItem,
  AppTabs,
  ConfirmationDialog,
  EntityClassItem,
  EntityTypeItem,
  LabelItem,
  SkeletonWrapper,
} from 'components/shared';
import {
  AddIcon,
  EditIcon,
  KebabIcon,
  TimeGapIcon,
} from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { useAppParams } from 'lib/hooks';
import {
  deleteDataEntityGroup,
  fetchDataEntityAlerts,
  fetchDataEntityDetails,
  fetchDataSetQualityTestReport,
} from 'redux/thunks';
import {
  getDataEntityAddToGroupStatuses,
  getDataEntityDeleteFromGroupStatuses,
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityGroupUpdatingStatuses,
  getDataEntityOpenAlertsCount,
  getDatasetTestReport,
  getIsDataEntityBelongsToClass,
  getSearchId,
} from 'redux/selectors';
import { useAppPaths } from 'lib/hooks/useAppPaths';
import DataEntityDetailsSkeleton from './DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import InternalNameFormDialog from './InternalNameFormDialog/InternalNameFormDialog';
import DataEntityGroupForm from './DataEntityGroupForm/DataEntityGroupForm';
import LinkedItemsList from './LinkedItemsList/LinkedItemsList';
import * as S from './DataEntityDetailsStyles';

// lazy components
const Overview = React.lazy(() => import('./Overview/Overview'));
const DatasetStructure = React.lazy(
  () => import('./DatasetStructure/DatasetStructure')
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
  const {
    searchPath,
    dataEntityOverviewPath,
    datasetStructurePath,
    dataEntityLineagePath,
    dataEntityTestReportPath,
    dataEntityLinkedItemsPath,
    dataEntityHistoryPath,
    dataEntityAlertsPath,
    dataEntityActivityPath,
  } = useAppPaths();

  const openAlertsCount = useAppSelector(getDataEntityOpenAlertsCount);
  const searchId = useAppSelector(getSearchId);
  const dataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );
  const { isDataset, isQualityTest, isTransformer } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );

  const { isLoaded: isDataEntityGroupUpdated } = useAppSelector(
    getDataEntityGroupUpdatingStatuses
  );
  const {
    isLoading: isDataEntityDetailsFetching,
    isLoaded: isDataEntityDetailsFetched,
  } = useAppSelector(getDataEntityDetailsFetchingStatuses);
  const { isLoaded: isDataEntityAddedToGroup } = useAppSelector(
    getDataEntityAddToGroupStatuses
  );
  const { isLoaded: isDataEntityDeletedFromGroup } = useAppSelector(
    getDataEntityDeleteFromGroupStatuses
  );

  const datasetQualityTestReport = useAppSelector(
    getDatasetTestReport(dataEntityId)
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
      {dataEntityDetails && !isDataEntityDetailsFetching ? (
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
                  <InternalNameFormDialog
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
                            ? 'Edit custom'
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
            <Grid
              container
              item
              alignItems="center"
              width="auto"
              flexWrap="nowrap"
            >
              {dataEntityDetails.updatedAt ? (
                <>
                  <TimeGapIcon />
                  <Typography
                    variant="body1"
                    sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  >
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
                    childrenSx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
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
      {isDataEntityDetailsFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <DataEntityDetailsSkeleton
              width={randomSkeletonPercentWidth()}
            />
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
              component={DataEntityAlerts}
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
              from="/dataentities/:dataEntityId"
              to="/dataentities/:dataEntityId/overview"
            />
            <Redirect
              from="/embedded/dataentities/:dataEntityId"
              to="/embedded/dataentities/:dataEntityId/overview"
            />
          </Switch>
        </React.Suspense>
      ) : null}
    </S.Container>
  );
};

export default DataEntityDetailsView;
