import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';

interface TestRunStatusReasonModalProps {
  openBtn: JSX.Element;
  statusReason: string;
}

const TestRunStatusReasonModal: FC<TestRunStatusReasonModalProps> = ({
  openBtn,
  statusReason,
}) => (
  <DialogWrapper
    maxWidth='md'
    renderOpenBtn={({ handleOpen }) =>
      React.cloneElement(openBtn, { onClick: handleOpen })
    }
    title={
      <Typography variant='h4' component='span'>
        Status reason
      </Typography>
    }
    renderContent={() => <Typography variant='body1'>{statusReason}</Typography>}
  />
);

export default TestRunStatusReasonModal;
