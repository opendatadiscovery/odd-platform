import React from 'react';
import { Typography } from '@mui/material';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from './ConfirmationDialogStyles';

interface ConfirmationDialogProps {
  actionBtn: JSX.Element;
  actionTitle: string;
  actionText: JSX.Element | string;
  actionName: string;
  onConfirm: () => Promise<unknown>;
  onCancel?: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  actionBtn,
  actionTitle,
  actionText,
  actionName,
  onConfirm,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const onClose = (action?: () => Promise<unknown>) => () => {
    if (action) {
      setIsLoading(true);
      action().then(
        () => setIsLoading(false),
        () => setIsLoading(false)
      );
    }
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      {actionTitle}
    </Typography>
  );

  const formContent = () => (
    <Typography variant="subtitle1">{actionText}</Typography>
  );

  const formActionButtons = () => (
    <S.Actions>
      <AppButton size="large" color="primary" onClick={onClose(onConfirm)}>
        {actionName}
      </AppButton>
    </S.Actions>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(actionBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      isLoading={isLoading}
    />
  );
};

export default ConfirmationDialog;
