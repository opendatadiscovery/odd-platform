import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppSelector } from 'redux/lib/hooks';
import { getQualityTestByTestId } from 'redux/selectors/dataQualityTest.selectors';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import TestReportDetailsOverview from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverview';
import TestReportDetailsHistory from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistory';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import { useAppPaths } from 'lib/hooks';

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

  const qualityTest = useAppSelector(state =>
    getQualityTestByTestId(state, dataQATestId)
  );
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
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        wrap="nowrap"
      >
        <AppTooltip
          title={() =>
            qualityTest?.internalName || qualityTest?.externalName
          }
        >
          <Typography noWrap variant="h2">
            {qualityTest?.internalName || qualityTest?.externalName}
          </Typography>
        </AppTooltip>
        <AppButton size="small" color="tertiary" sx={{ ml: 2 }}>
          <Link to={dataEntityDetailsPath(dataQATestId)}>Go to page</Link>
        </AppButton>
      </Grid>
      <Grid container wrap="wrap" justifyContent="center" sx={{ mt: 2 }}>
        {tabs.length && selectedTab >= 0 ? (
          <AppTabs
            type="secondary"
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
            from="/dataentities/:dataEntityId/test-reports/:dataQATestId?"
            to="/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview"
          />
          <Redirect
            from="/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?"
            to="/embedded/dataentities/:dataEntityId/test-reports/:dataQATestId?/overview"
          />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
