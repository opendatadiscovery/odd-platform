import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  AppButton,
  AppCircularProgress,
  type AppTabItem,
  AppTabs,
  AppTooltip,
} from 'components/shared';
import { getQualityTestByTestId, getResourcePermissions } from 'redux/selectors';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';

// lazy components
const TestReportDetailsOverview = React.lazy(
  () => import('./TestReportDetailsOverview/TestReportDetailsOverview')
);
const TestReportDetailsHistory = React.lazy(
  () => import('./TestReportDetailsHistory/TestReportDetailsHistory')
);

interface TestRunDetailsProps {
  dataQATestId: number;
  dataEntityId: number;
  reportDetailsViewType: string;
}

const TestReportDetails: React.FC<TestRunDetailsProps> = ({
  dataQATestId,
  dataEntityId,
  reportDetailsViewType,
}) => {
  const {
    dataEntityDetailsPath,
    testReportDetailsOverviewPath,
    testReportDetailsHistoryPath,
    dataEntityTestPath,
  } = useAppPaths();

  const qualityTest = useAppSelector(getQualityTestByTestId(dataQATestId));
  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: 'Overview',
        link: testReportDetailsOverviewPath(dataEntityId, dataQATestId),
        value: 'overview',
      },
      {
        name: 'History',
        link: testReportDetailsHistoryPath(dataEntityId, dataQATestId),
        value: 'history',
      },
    ],
    [dataEntityId, dataQATestId]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setSelectedTab(
      reportDetailsViewType
        ? tabs.findIndex(tab => tab.value === reportDetailsViewType)
        : 0
    );
  }, [tabs, reportDetailsViewType]);

  return (
    <Grid container sx={{ p: 2 }}>
      <Grid container alignItems='center' wrap='nowrap'>
        <Grid container>
          <AppTooltip title={qualityTest?.internalName || qualityTest?.externalName}>
            <Typography noWrap variant='h2'>
              {qualityTest?.internalName || qualityTest?.externalName}
            </Typography>
          </AppTooltip>
        </Grid>
        <AppButton
          to={dataEntityDetailsPath(dataQATestId)}
          size='small'
          color='tertiary'
          sx={{ ml: 2, width: 'auto' }}
        >
          Go to page
        </AppButton>
      </Grid>
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        flexDirection='column'
        sx={{ mt: 2 }}
      >
        {tabs.length && selectedTab >= 0 ? (
          <AppTabs
            type='secondary'
            items={tabs}
            selectedTab={selectedTab}
            handleTabChange={() => {}}
          />
        ) : null}
        <React.Suspense fallback={<AppCircularProgress sx={{ mt: 5 }} size={40} />}>
          <Switch>
            <Route
              exact
              path={testReportDetailsOverviewPath()}
              render={() => (
                <WithPermissionsProvider
                  allowedPermissions={[Permission.DATASET_TEST_RUN_SET_SEVERITY]}
                  resourcePermissions={resourcePermissions}
                  Component={TestReportDetailsOverview}
                />
              )}
            />
            <Route
              exact
              path={testReportDetailsHistoryPath()}
              component={TestReportDetailsHistory}
            />
            <Redirect from={dataEntityTestPath()} to={testReportDetailsOverviewPath()} />
          </Switch>
        </React.Suspense>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
