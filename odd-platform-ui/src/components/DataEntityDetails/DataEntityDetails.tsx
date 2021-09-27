import { Typography, Grid } from '@mui/material';
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';
import cx from 'classnames';
import {
  dataEntityOverviewPath,
  datasetStructurePath,
  dataEntityLineagePath,
  dataEntityTestReportPath,
  dataEntityAlertsPath,
  dataEntityHistoryPath,
} from 'lib/paths';
import {
  DataEntityDetails,
  DataEntityApiGetDataEntityDetailsRequest,
} from 'generated-sources';
import { FetchStatus, ErrorState } from 'redux/interfaces';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import TimeGapIcon from 'components/shared/Icons/TimeGapIcon';
import InternalNameFormDialogContainer from 'components/DataEntityDetails/InternalNameFormDialog/InternalNameFormDialogContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AddIcon from 'components/shared/Icons/AddIcon';
import EditIcon from 'components/shared/Icons/EditIcon';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import TestReportContainer from 'components/DataEntityDetails/TestReport/TestReportContainer';
import TestReportDetailsContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsContainer';
import DataEntityAlertsContainer from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsContainer';
import DataEntityDetailsSkeleton from 'components/DataEntityDetails/DataEntityDetailsSkeleton/DataEntityDetailsSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import QualityTestHistoryContainer from 'components/DataEntityDetails/QualityTestRunsHistory/QualityTestRunsHistoryContainer';
import OverviewContainer from './Overview/OverviewContainer';
import DatasetStructureContainer from './DatasetStructure/DatasetStructureContainer';
import LineageContainer from './Lineage/LineageContainer';
import { StylesType } from './DataEntityDetailsStyles';
import AlertBannersContainer from './AlertBanners/AlertBannersContainer';

interface DataEntityDetailsProps extends StylesType {
  viewType: string;
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  isDataset: boolean;
  isQualityTest: boolean;
  fetchDataEntityDetails: (
    params: DataEntityApiGetDataEntityDetailsRequest
  ) => void;
  dataEntityFetchingStatus: FetchStatus;
  dataEntityFetchingError?: ErrorState;
}

const DataEntityDetailsView: React.FC<DataEntityDetailsProps> = ({
  classes,
  viewType,
  dataEntityId,
  dataEntityDetails,
  isDataset,
  isQualityTest,
  fetchDataEntityDetails,
  dataEntityFetchingStatus,
  dataEntityFetchingError,
}) => {
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
      },
    ]);
  }, [dataEntityId, isQualityTest, isDataset]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    fetchDataEntityDetails({ dataEntityId });
  }, [fetchDataEntityDetails, dataEntityId]);

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.value === viewType) : 0
    );
  }, [tabs, viewType]);

  return (
    <div className={classes.container}>
      {dataEntityDetails && dataEntityFetchingStatus !== 'fetching' ? (
        <>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item className={classes.caption}>
              <Grid container item alignItems="center">
                <Typography variant="h1" noWrap>
                  {dataEntityDetails.internalName
                    ? dataEntityDetails.internalName
                    : dataEntityDetails.externalName}
                </Typography>
                {dataEntityDetails.types.map(type => (
                  <EntityTypeItem
                    key={type.id}
                    typeName={type.name}
                    className={classes.entityTypeLabel}
                  />
                ))}
                <div className={cx(classes.internalNameEditBtnContainer)}>
                  <InternalNameFormDialogContainer
                    dataEntityId={dataEntityId}
                    btnCreateEl={
                      <AppButton
                        className={classes.internalNameEditBtn}
                        onClick={() => {}}
                        size="medium"
                        color="tertiary"
                        icon={
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
                </div>
              </Grid>
              {dataEntityDetails.internalName && (
                <Grid container alignItems="center">
                  <div className={classes.originalLabel}>Original</div>
                  <Typography variant="body1" noWrap>
                    {dataEntityDetails.externalName}
                  </Typography>
                </Grid>
              )}
            </Grid>
            <Grid item className={classes.updatedAt}>
              {dataEntityDetails.updatedAt ? (
                <>
                  <TimeGapIcon classes={{ root: classes.updatedAtIcon }} />
                  <Typography variant="body1">
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
          <AlertBannersContainer dataEntityId={dataEntityId} />
          {tabs.length && selectedTab >= 0 ? (
            <AppTabs
              className={classes.tabsContainer}
              variant="primary"
              items={tabs}
              selectedTab={selectedTab}
              handleTabChange={() => {}}
            />
          ) : null}
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
          <Redirect
            from="/dataentities/:dataEntityId"
            to="/dataentities/:dataEntityId/overview"
          />
        </Switch>
      ) : null}
      <AppErrorPage
        fetchStatus={dataEntityFetchingStatus}
        error={dataEntityFetchingError}
      />
    </div>
  );
};

export default DataEntityDetailsView;
