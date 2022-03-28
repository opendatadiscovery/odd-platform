import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  dataEntityAlertsPath,
  dataEntityHistoryPath,
  dataEntityLineagePath,
  dataEntityLinkedItemsPath,
  dataEntityOverviewPath,
  dataEntityTestReportPath,
  datasetStructurePath,
} from 'lib/paths';
import {
  AlertList,
  DataEntityApiGetDataEntityAlertsRequest,
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityDetails,
} from 'generated-sources';
import { ErrorState, FetchStatus } from 'redux/interfaces';
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
import LinkedItemsListContainer from 'components/DataEntityDetails/LinkedItemsList/LinkedItemsListContainer';
import * as S from './DataEntityDetailsStyles';

// lazy components
const OverviewContainer = React.lazy(
  () => import('./Overview/OverviewContainer')
);
const DatasetStructureContainer = React.lazy(
  () => import('./DatasetStructure/DatasetStructureContainer')
);
const LineageContainer = React.lazy(
  () => import('./Lineage/LineageContainer')
);
const TestReportContainer = React.lazy(
  () => import('./TestReport/TestReportContainer')
);
const TestReportDetailsContainer = React.lazy(
  () => import('./TestReport/TestReportDetails/TestReportDetailsContainer')
);
const DataEntityAlertsContainer = React.lazy(
  () => import('./DataEntityAlerts/DataEntityAlertsContainer')
);
const QualityTestHistoryContainer = React.lazy(
  () => import('./QualityTestRunsHistory/TestRunsHistoryContainer')
);

interface DataEntityDetailsProps {
  viewType: string;
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  isDataset: boolean;
  isQualityTest: boolean;
  fetchDataEntityDetails: (
    params: DataEntityApiGetDataEntityDetailsRequest
  ) => void;
  fetchDataEntityAlerts: (
    params: DataEntityApiGetDataEntityAlertsRequest
  ) => Promise<AlertList>;
  dataEntityFetchingStatus: FetchStatus;
  dataEntityFetchingError?: ErrorState;
  openAlertsCount: number;
}

const DataEntityDetailsView: React.FC<DataEntityDetailsProps> = ({
  viewType,
  dataEntityId,
  dataEntityDetails,
  isDataset,
  isQualityTest,
  fetchDataEntityDetails,
  fetchDataEntityAlerts,
  dataEntityFetchingStatus,
  dataEntityFetchingError,
  openAlertsCount,
}) => {
  React.useEffect(() => {
    fetchDataEntityDetails({ dataEntityId });
  }, [fetchDataEntityDetails, dataEntityId]);

  React.useEffect(() => {
    fetchDataEntityAlerts({ dataEntityId });
  }, []);

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
        hidden: !isDataset,
        value: 'test-reports',
      },
      {
        name: 'History',
        link: dataEntityHistoryPath(dataEntityId),
        hidden: !isQualityTest,
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
    ]);
  }, [
    dataEntityId,
    isQualityTest,
    isDataset,
    dataEntityDetails,
    openAlertsCount,
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
    );
  }, [tabs, viewType]);

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
                    typeName={entityClass.name}
                  />
                ))}
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
              {dataEntityDetails.internalName && (
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
              component={OverviewContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/structure/:versionId?"
              component={DatasetStructureContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/lineage"
              component={LineageContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/test-reports/:dataqatestId?/:reportDetailsViewType?"
              component={TestReportContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/test-reports/:dataqatestId?/:reportDetailsViewType?"
              component={TestReportDetailsContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/alerts"
              component={DataEntityAlertsContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/history"
              component={QualityTestHistoryContainer}
            />
            <Route
              exact
              path="/dataentities/:dataEntityId/linked-items"
              component={LinkedItemsListContainer}
            />
            <Redirect
              from="/dataentities/:dataEntityId"
              to="/dataentities/:dataEntityId/overview"
            />
          </Switch>
        </React.Suspense>
      ) : null}
      <AppErrorPage
        fetchStatus={dataEntityFetchingStatus}
        error={dataEntityFetchingError}
      />
    </S.Container>
  );
};

export default DataEntityDetailsView;
