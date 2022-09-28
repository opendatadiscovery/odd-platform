import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { DataEntityRun } from 'generated-sources';
import { format, formatDistanceStrict } from 'date-fns';
import {
  TestRunStatusItem,
  AppButton,
  DialogWrapper,
  LabeledInfoItem,
} from 'components/shared';
import { useAppPaths } from 'lib/hooks';
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
  const { dataEntityDetailsPath } = useAppPaths();

  const modalTitle = (
    <Grid container justifyContent='space-between' alignItems='center'>
      <Typography variant='h3' component='span'>
        {dataQATestName}
      </Typography>
      <Link to={dataEntityDetailsPath(dataQATestId)}>
        <AppButton size='small' color='tertiary'>
          Go to page
        </AppButton>
      </Link>
    </Grid>
  );

  const runDate = React.useMemo(
    () =>
      dataQATestRun.startTime && format(dataQATestRun.startTime, 'd MMM yyyy, HH:MM a'),
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
      maxWidth='sm'
    />
  );
};

export default TestRunStatusReasonModal;
