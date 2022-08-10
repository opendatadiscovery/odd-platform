import React, { useCallback, useMemo } from 'react';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { Typography } from '@mui/material';
import ObjectRender from 'components/shared/ObjectRender/ObjectRender';
import { DataQualityTestExpectation } from 'generated-sources';

type TestReportDetailsOverviewExpectationsModalProps = {
  qualityTestName: string;
  expectations: DataQualityTestExpectation;
};

const TestReportDetailsOverviewExpectationsModal: React.FC<
  TestReportDetailsOverviewExpectationsModalProps
> = ({ qualityTestName, expectations }) => {
  const parsedObj = useMemo(
    () =>
      Object.entries(expectations).reduce((ac, [key, value]) => {
        let parsed = '';
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value;
        }
        return { ...ac, [key]: parsed };
      }, {}),
    [expectations]
  );

  const modalTitle = useMemo(
    () => (
      <Typography variant="h3" component="span">
        {qualityTestName}
      </Typography>
    ),
    [qualityTestName]
  );

  const renderOpenBtn = useCallback(
    ({ handleOpen }) => (
      <AppButton size="small" color="tertiary" onClick={handleOpen}>
        View all
      </AppButton>
    ),
    []
  );

  const renderContent = useCallback(
    () => (
      <>
        <Typography variant="h4" color="texts.secondary" mb={2}>
          Expectations
        </Typography>
        <ObjectRender input={parsedObj} />
      </>
    ),
    [parsedObj]
  );

  return (
    <DialogWrapper
      renderOpenBtn={renderOpenBtn}
      title={modalTitle}
      renderContent={renderContent}
      maxWidth="sm"
    />
  );
};

TestReportDetailsOverviewExpectationsModal.displayName =
  'TestReportDetailsOverviewExpectationsModal';

export default TestReportDetailsOverviewExpectationsModal;
