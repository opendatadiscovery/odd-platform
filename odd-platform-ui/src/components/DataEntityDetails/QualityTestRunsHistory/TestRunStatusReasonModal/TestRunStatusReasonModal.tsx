import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { DataQualityTestRun } from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { dataEntityDetailsPath } from 'lib/paths';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import { format, formatDistanceStrict } from 'date-fns';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import {
  StatsContainer,
  StatusReasonContainer,
} from './TestRunStatusReasonModalStyles';

interface TestRunStatusReasonModalProps {
  btnCreateEl: JSX.Element;
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRun: DataQualityTestRun;
}

const TestRunStatusReasonModal: React.FC<TestRunStatusReasonModalProps> = ({
  btnCreateEl,
  dataQATestId,
  dataQATestName,
  dataQATestRun,
}) => {
  const modalTitle = (
    <Grid container justifyContent="space-between" alignItems="center">
      <Typography variant="h3" component="span">
        {dataQATestName}
      </Typography>
      <Link to={dataEntityDetailsPath(dataQATestId)}>
        <AppButton size="small" color="tertiary">
          Go to page
        </AppButton>
      </Link>
    </Grid>
  );

  const modalContent = () => (
    <>
      <StatsContainer container>
        <LabeledInfoItem label="Date" valueLineHeight={26}>
          {dataQATestRun.startTime &&
            format(dataQATestRun.startTime, 'd MMM yyyy, HH:MM a')}
        </LabeledInfoItem>
        <LabeledInfoItem label="Duration" valueLineHeight={26}>
          {dataQATestRun.endTime &&
            dataQATestRun.startTime &&
            formatDistanceStrict(
              dataQATestRun.endTime,
              dataQATestRun.startTime,
              {
                addSuffix: false,
              }
            )}
        </LabeledInfoItem>
        <LabeledInfoItem label="Status">
          <TestRunStatusItem
            sx={{ ml: -0.5 }}
            typeName={dataQATestRun.status}
          />
        </LabeledInfoItem>
      </StatsContainer>
      <StatusReasonContainer>
        <LabeledInfoItem label="Status reason" valueWrap>
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
      maxWidth="sm"
    />
  );
};

export default TestRunStatusReasonModal;
