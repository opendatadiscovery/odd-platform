import React from 'react';
import {
  DataQualityTest,
  DataQualityTestRunStatus,
} from 'generated-sources';
import { Collapse, Grid, Typography } from '@mui/material';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import MinusIcon from 'components/shared/Icons/MinusIcon';
import PlusIcon from 'components/shared/Icons/PlusIcon';
import TestItem from 'components/DataEntityDetails/TestReport/TestReportItem/TestItem/TestItem';
import { dataEntityTestPath } from 'lib/paths';
import { Link } from 'react-router-dom';
import { DataSetQualityTestsStatusCount } from 'redux/interfaces';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { TestReportBySuitNameHeader } from './TestReportItemStyles';

interface TestReportItemProps {
  suitName: string;
  dataSetId: number;
  dataqatestId: number;
  dataQATestList: DataQualityTest[];
  dataQATestReport: DataSetQualityTestsStatusCount;
}

const TestReportItem: React.FC<TestReportItemProps> = ({
  suitName,
  dataSetId,
  dataqatestId,
  dataQATestList,
  dataQATestReport,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (dataQATestList.length < 5) setOpen(true);
  }, [dataQATestList]);

  const collapseBtn = (
    <AppIconButton
      sx={{ mr: 1 }}
      color="collapse"
      open={open}
      icon={
        open ? (
          <MinusIcon width={6} height={6} />
        ) : (
          <PlusIcon width={6} height={6} />
        )
      }
      aria-label="expand row"
      onClick={() => setOpen(!open)}
    />
  );

  return (
    <Grid container direction="column" wrap="nowrap">
      <TestReportBySuitNameHeader container wrap="nowrap">
        <Grid item>{collapseBtn}</Grid>
        <Grid
          item
          container
          wrap="nowrap"
          onClick={() => setOpen(prevState => !prevState)}
        >
          <Grid item>
            <Typography variant="body1">{suitName}</Typography>
          </Grid>
          <Grid item container justifyContent="flex-end">
            {Object.entries(dataQATestReport).map(
              ([testType, count]) =>
                count !== 0 && (
                  <TestRunStatusItem
                    key={testType}
                    count={count}
                    typeName={
                      testType.toUpperCase() as DataQualityTestRunStatus
                    }
                    size="small"
                  />
                )
            )}
          </Grid>
        </Grid>
      </TestReportBySuitNameHeader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {open && dataQATestList.length
          ? dataQATestList.map(dataQATest => (
              <Link
                to={dataEntityTestPath(dataSetId, dataQATest.id)}
                key={dataQATest.id}
              >
                <TestItem
                  active={dataqatestId === dataQATest.id}
                  latestRunStatus={dataQATest.latestRun?.status}
                  testName={
                    dataQATest.internalName || dataQATest.externalName
                  }
                  testStartTime={dataQATest.latestRun?.startTime}
                  testEndTime={dataQATest.latestRun?.endTime}
                  testExpectations={dataQATest?.expectation}
                />
              </Link>
            ))
          : null}
      </Collapse>
    </Grid>
  );
};

export default TestReportItem;
