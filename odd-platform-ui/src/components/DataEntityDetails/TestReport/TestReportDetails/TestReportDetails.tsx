import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppTabs, AppTabItem, AppButton, AppTooltip } from 'components/shared';
import { getQualityTestByTestId } from 'redux/selectors';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import TestReportDetailsOverview from './TestReportDetailsOverview/TestReportDetailsOverview';
import TestReportDetailsHistory from './TestReportDetailsHistory/TestReportDetailsHistory';

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
  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);
  const {
    dataEntityDetailsPath,
    testReportDetailsOverviewPath,
    testReportDetailsHistoryPath,
  } = useAppPaths();

  const qualityTest = useAppSelector(getQualityTestByTestId(dataQATestId));

  React.useEffect(() => {
    setTabs([
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
    ]);
  }, [dataEntityId, dataQATestId]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

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
          <AppTooltip
            title={() => qualityTest?.internalName || qualityTest?.externalName}
          >
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
      <Grid container justifyContent='center' sx={{ mt: 2 }}>
        {tabs.length && selectedTab >= 0 ? (
          <AppTabs
            type='secondary'
            items={tabs}
            selectedTab={selectedTab}
            handleTabChange={() => {}}
          />
        ) : null}
        <Switch>
          <Route
            exact
            path={[
              '/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview',
              '/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview',
            ]}
            component={TestReportDetailsOverview}
          />
          <Route
            exact
            path={[
              '/dataentities/:dataEntityId/test-reports/:dataQATestId?/history',
              '/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/history',
            ]}
            component={TestReportDetailsHistory}
          />
          <Redirect
            from='/dataentities/:dataEntityId/test-reports/:dataQATestId?'
            to='/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview'
          />
          <Redirect
            from='/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?'
            to='/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview'
          />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
