import React from 'react';
import { DialogWrapper } from 'components/shared';
import { Typography } from '@mui/material';
import { DataQualityTestExpectation } from 'generated-sources';

interface TestReportDetailsOverviewParametersModalProps {
  openBtnEl: JSX.Element;
  expectations: DataQualityTestExpectation;
}

const TestReportDetailsOverviewParametersModal: React.FC<
  TestReportDetailsOverviewParametersModalProps
> = ({ openBtnEl, expectations }) => {
  const modalTitle = (
    <Typography variant="h3" component="span">
      Parameters
    </Typography>
  );

  const renderContent = React.useCallback(
    () => (
      <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(expectations, null, 2)}
      </Typography>
    ),
    [expectations]
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtnEl, { onClick: handleOpen })
      }
      title={modalTitle}
      renderContent={renderContent}
      maxWidth="md"
    />
  );
};

TestReportDetailsOverviewParametersModal.displayName =
  'TestReportDetailsOverviewParametersModal';

export default TestReportDetailsOverviewParametersModal;
