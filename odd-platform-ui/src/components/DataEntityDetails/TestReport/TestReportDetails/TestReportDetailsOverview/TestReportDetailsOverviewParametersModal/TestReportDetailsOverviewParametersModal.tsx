import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DialogWrapper } from 'components/shared/elements';
import type { DataQualityTestExpectation } from 'generated-sources';

interface TestReportDetailsOverviewParametersModalProps {
  openBtnEl: JSX.Element;
  expectations: DataQualityTestExpectation;
}

const TestReportDetailsOverviewParametersModal: React.FC<
  TestReportDetailsOverviewParametersModalProps
> = ({ openBtnEl, expectations }) => {
  const { t } = useTranslation();

  const modalTitle = (
    <Typography variant='h3' component='span'>
      {t('Parameters')}
    </Typography>
  );

  const renderContent = React.useCallback(
    () => (
      <Typography variant='body1' sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
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
      maxWidth='lg'
    />
  );
};

TestReportDetailsOverviewParametersModal.displayName =
  'TestReportDetailsOverviewParametersModal';

export default TestReportDetailsOverviewParametersModal;
