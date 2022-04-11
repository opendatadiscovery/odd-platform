import React from 'react';
import { DataQualityTest } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import {
  dataEntityDetailsPath,
  testReportDetailsHistoryPath,
  testReportDetailsOverviewPath,
} from 'lib/paths';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import TestReportDetailsOverviewContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewContainer';
import TestReportDetailsHistoryContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistoryContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';

interface TestRunDetailsProps {
  dataQATestId: number;
  dataEntityId: number;
  reportDetailsViewType: string;
  qualityTest: DataQualityTest;
}

const TestReportDetails: React.FC<TestRunDetailsProps> = ({
  dataQATestId,
  dataEntityId,
  reportDetailsViewType,
  qualityTest,
}) => {
  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

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
            path="/dataentities/:dataEntityId/test-reports/:dataqatestId?/overview"
            component={TestReportDetailsOverviewContainer}
          />
          <Route
            exact
            path="/dataentities/:dataEntityId/test-reports/:dataqatestId?/history"
            component={TestReportDetailsHistoryContainer}
          />
          <Redirect
            from="/dataentities/:dataEntityId/test-reports/:dataqatestId?"
            to="/dataentities/:dataEntityId/test-reports/:dataqatestId?/overview"
          />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default TestReportDetails;
