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
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  actionBtn,
  actionTitle,
  actionText,
  actionName,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const onClose =
    (handleClose: () => void, action?: () => Promise<unknown>) => () => {
      if (action) {
        setIsLoading(true);
        action().then(() => {
          setIsLoading(false);
          handleClose();
        });
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

  const formActionButtons = ({
    handleClose,
  }: {
    handleClose: () => void;
  }) => (
    <S.Actions>
      <AppButton
        size="large"
        color="primary"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClose(handleClose, onConfirm)();
        }}
      >
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
