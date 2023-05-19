import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Button,
  AppCircularProgress,
  type AppTabItem,
  AppTabs,
  AppTooltip,
} from 'components/shared/elements';
import { getQualityTestByTestId, getResourcePermissions } from 'redux/selectors';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';

// lazy elements
const TestReportDetailsOverview = React.lazy(
  () => import('./TestReportDetailsOverview/TestReportDetailsOverview')
);
const TestReportDetailsHistory = React.lazy(
  () => import('./TestReportDetailsHistory/TestReportDetailsHistory')
);

const TestReportDetails: React.FC = () => {
  const { dataQATestId, dataEntityId, testReportViewType } = useAppParams();
  const {
    dataEntityOverviewPath,
    testReportDetailsOverviewPath,
    testReportDetailsHistoryPath,
    DataEntityRoutes,
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
        value: DataEntityRoutes.overview,
      },
      {
        name: 'History',
        link: testReportDetailsHistoryPath(dataEntityId, dataQATestId),
        value: DataEntityRoutes.history,
      },
    ],
    [dataEntityId, dataQATestId]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setSelectedTab(
      testReportViewType ? tabs.findIndex(tab => tab.value === testReportViewType) : 0
    );
  }, [tabs, testReportViewType]);

  return (
    <Grid container sx={{ p: 2 }}>
      <Grid container alignItems='center' wrap='nowrap'>
        <Grid container maxWidth='80%'>
          <AppTooltip title={qualityTest?.internalName || qualityTest?.externalName}>
            <Typography noWrap variant='h2'>
              {qualityTest?.internalName || qualityTest?.externalName}
            </Typography>
          </AppTooltip>
        </Grid>
        <Button
          text='Go to page'
          to={dataEntityOverviewPath(dataQATestId)}
          buttonType='tertiary-m'
          sx={{ ml: 2, flexShrink: 0 }}
        />
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
            sx={{ width: '100%' }}
            tabSx={{ flexGrow: 1 }}
          />
        ) : null}
        <React.Suspense fallback={<AppCircularProgress sx={{ mt: 5 }} size={40} />}>
          <Routes>
            <Route path={DataEntityRoutes.testReportViewTypeParam}>
              <Route
                path={DataEntityRoutes.overview}
                element={
                  <WithPermissionsProvider
                    allowedPermissions={[Permission.DATASET_TEST_RUN_SET_SEVERITY]}
                    resourcePermissions={resourcePermissions}
                    Component={TestReportDetailsOverview}
                  />
                }
              />
              <Route
                path={DataEntityRoutes.history}
                element={<TestReportDetailsHistory />}
              />
              <Route path='' element={<Navigate to={DataEntityRoutes.overview} />} />
            </Route>
          </Routes>
        </React.Suspense>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
