import React from 'react';
import { Typography } from '@mui/material';
import { type DataEntityRun } from 'generated-sources';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDateTime } from 'lib/hooks';
import TestRunStatusReasonModal from '../TestRunStatusReasonModal/TestRunStatusReasonModal';
import { Container, StatusReasonModalBtnContainer } from './TestRunItemStyles';
import { ColContainer } from '../TestRunsHistoryStyles';

interface QualityTestRunItemProps {
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRun: DataEntityRun;
}

const TestRunItem: React.FC<QualityTestRunItemProps> = ({
  dataQATestId,
  dataQATestName,
  dataQATestRun,
}) => {
  const { qualityTestRunFormattedDateTime, formatDistanceStrict } = useAppDateTime();

  return (
    <Container container>
      <ColContainer item $colType='md'>
        <Typography variant='body1'>
          {dataQATestRun.startTime &&
            qualityTestRunFormattedDateTime(dataQATestRun.startTime.getTime())}
        </Typography>
      </ColContainer>
      <ColContainer item $colType='sm'>
        <TestRunStatusItem sx={{ ml: -0.5 }} typeName={dataQATestRun.status} />
      </ColContainer>
      <ColContainer item $colType='lg'>
        <Typography variant='body1' title={dataQATestRun.statusReason} noWrap>
          {dataQATestRun.statusReason}
        </Typography>
        {dataQATestRun.statusReason && (
          <StatusReasonModalBtnContainer>
            <TestRunStatusReasonModal
              dataQATestId={dataQATestId}
              dataQATestName={dataQATestName}
              dataQATestRun={dataQATestRun}
              btnCreateEl={
                <AppButton size='small' color='tertiary'>
                  See details
                </AppButton>
              }
            />
          </StatusReasonModalBtnContainer>
        )}
      </ColContainer>
      <ColContainer item $colType='sm'>
        <Typography variant='body1'>
          {dataQATestRun.endTime &&
            dataQATestRun.startTime &&
            formatDistanceStrict(dataQATestRun.endTime, dataQATestRun.startTime, {
              addSuffix: false,
            })}
        </Typography>
      </ColContainer>
    </Container>
  );
};

export default TestRunItem;
