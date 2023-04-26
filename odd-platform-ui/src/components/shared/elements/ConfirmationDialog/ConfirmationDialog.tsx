import React from 'react';
import { Typography } from '@mui/material';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import * as S from 'components/shared/elements/ConfirmationDialog/ConfirmationDialogStyles';
import Button from 'components/shared/elements/Button/Button';

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
  const [isLoading, setIsLoading] = React.useState(false);
  const onClose = (handleClose: () => void, action?: () => Promise<unknown>) => () => {
    if (action) {
      setIsLoading(true);
      action().then(() => {
        setIsLoading(false);
        handleClose();
      });
    }
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {actionTitle}
    </Typography>
  );

  const formContent = () => <Typography variant='subtitle1'>{actionText}</Typography>;

  const formActionButtons = ({ handleClose }: { handleClose: () => void }) => (
    <S.Actions>
      <Button
        text={actionName}
        buttonType='main-lg'
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClose(handleClose, onConfirm)();
        }}
      />
    </S.Actions>
  );

  React.useEffect(() => () => setIsLoading(false), [setIsLoading]);

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(actionBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      isLoading={isLoading}
      formSubmitHandler={onConfirm}
    />
  );
};

export default ConfirmationDialog;
