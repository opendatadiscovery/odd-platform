import { Grid, Typography } from '@mui/material';
import React from 'react';
import type { DataEntityRun } from 'generated-sources';
import {
  Button,
  DialogWrapper,
  LabeledInfoItem,
  TestRunStatusItem,
} from 'components/shared/elements';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import { StatsContainer, StatusReasonContainer } from './TestRunStatusReasonModalStyles';

interface TestRunStatusReasonModalProps {
  btnCreateEl: JSX.Element;
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRun: DataEntityRun;
}

const TestRunStatusReasonModal: React.FC<TestRunStatusReasonModalProps> = ({
  btnCreateEl,
  dataQATestId,
  dataQATestName,
  dataQATestRun,
}) => {
  const { dataEntityOverviewPath } = useAppPaths();
  const { qualityTestRunFormattedDateTime, formatDistanceStrict } = useAppDateTime();

  const modalTitle = (
    <Grid container justifyContent='space-between' alignItems='center'>
      <Typography variant='h3' component='span'>
        {dataQATestName}
      </Typography>
      <Button
        to={dataEntityOverviewPath(dataQATestId)}
        text='Go to page'
        buttonType='tertiary-m'
      />
    </Grid>
  );

  const runDate = React.useMemo(
    () =>
      dataQATestRun.startTime &&
      qualityTestRunFormattedDateTime(dataQATestRun.startTime.getTime()),
    [dataQATestRun.startTime]
  );

  const runDuration = React.useMemo(
    () =>
      dataQATestRun.endTime &&
      dataQATestRun.startTime &&
      formatDistanceStrict(dataQATestRun.endTime, dataQATestRun.startTime, {
        addSuffix: false,
      }),
    [dataQATestRun.startTime, dataQATestRun.endTime]
  );

  const modalContent = () => (
    <>
      <StatsContainer container>
        <LabeledInfoItem label='Date' valueLineHeight={26}>
          {runDate}
        </LabeledInfoItem>
        <LabeledInfoItem label='Duration' valueLineHeight={26}>
          {runDuration}
        </LabeledInfoItem>
        <LabeledInfoItem label='Status'>
          <TestRunStatusItem sx={{ ml: -0.5 }} typeName={dataQATestRun.status} />
        </LabeledInfoItem>
      </StatsContainer>
      <StatusReasonContainer>
        <LabeledInfoItem label='Status reason' valueWrap>
          {dataQATestRun.statusReason}
        </LabeledInfoItem>
      </StatusReasonContainer>
    </>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={modalTitle}
      renderContent={modalContent}
      maxWidth='md'
    />
  );
};

export default TestRunStatusReasonModal;
