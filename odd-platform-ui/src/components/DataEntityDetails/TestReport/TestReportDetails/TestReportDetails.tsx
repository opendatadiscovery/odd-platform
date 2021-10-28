import React from 'react';
import { DataQualityTest } from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import {
  testReportDetailsHistoryPath,
  testReportDetailsOverviewPath,
} from 'lib/paths';
import { Redirect, Route, Switch } from 'react-router-dom';
import TestReportDetailsOverviewContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewContainer';
import TestReportDetailsHistoryContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistoryContainer';
import { StylesType } from './TestReportDetailsStyles';

interface TestRunDetailsProps extends StylesType {
  dataqatestId: number;
  dataEntityId: number;
  reportDetailsViewType: string;
  qualityTest: DataQualityTest;
}

const TestReportDetails: React.FC<TestRunDetailsProps> = ({
  classes,
  dataqatestId,
  dataEntityId,
  reportDetailsViewType,
  qualityTest,
}) => {
  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'Overview',
        link: testReportDetailsOverviewPath(dataEntityId, dataqatestId),
        value: 'overview',
      },
      {
        name: 'History',
        link: testReportDetailsHistoryPath(dataEntityId, dataqatestId),
        value: 'history',
      },
      // {
      //   name: 'Retries',
      //   link: testReportDetailsRetriesPath(dataEntityId, dataqatestId),
      //   hidden: true,
      //   value: 'retries',
      // },
    ]);
  }, [dataEntityId, dataqatestId]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      reportDetailsViewType
        ? tabs.findIndex(tab => tab.value === reportDetailsViewType)
        : 0
    );
  }, [tabs, reportDetailsViewType]);

  return (
    <Grid container className={classes.container}>
      <Typography variant="h2">
        {qualityTest?.internalName || qualityTest?.externalName}
      </Typography>
      <Grid container wrap="wrap" justifyContent="center">
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
          {/* <Route */}
          {/*  exact */}
          {/*  path="/dataentities/:dataEntityId/test-reports/:dataqatestId?/retries" */}
          {/*  component={TestReportDetailsContainer} */}
          {/* /> */}
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
