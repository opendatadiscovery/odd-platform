import React from 'react';
import { Grid, Typography } from '@mui/material';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import * as S from 'components/shared/elements/ConfirmationDialog/ConfirmationDialogStyles';
import Button from 'components/shared/elements/Button/Button';
import { getErrorResponse } from 'lib/errorHandling';

interface ConfirmationDialogProps {
  actionBtn: JSX.Element;
  actionTitle: string;
  actionText: JSX.Element | string;
  actionName: string;
  onConfirm: () => Promise<unknown>;
  additionalContent?: JSX.Element | null;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  actionBtn,
  actionTitle,
  actionText,
  actionName,
  onConfirm,
  additionalContent,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string>();
  const onClose = (handleClose: () => void, action?: () => Promise<unknown>) => () => {
    if (action) {
      setErrorText(undefined);
      setIsLoading(true);
      action()
        .then(() => {
          setIsLoading(false);
          handleClose();
        })
        .catch(async (err: unknown) => {
          // A rejected confirm (e.g. a TanStack `mutateAsync` rejecting on a non-2xx) must NOT be
          // swallowed: clear the loading state so the dialog is no longer mouse-dead (the
          // DialogWrapper sets pointerEvents:none while loading), and surface the reason inline —
          // leaving the dialog open so the user can read it and retry or cancel.
          const { message } = await getErrorResponse(err);
          setIsLoading(false);
          setErrorText(message);
        });
    }
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {actionTitle}
    </Typography>
  );

  const formContent = () => (
    <Grid>
      <Typography variant='subtitle1'>{actionText}</Typography>
      {additionalContent}
    </Grid>
  );

  const formActionButtons = ({ handleClose }: { handleClose: () => void }) => (
    <S.Actions>
      <Button
        text={actionName}
        buttonType='main-lg'
        fullWidth
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClose(handleClose, onConfirm)();
        }}
      />
    </S.Actions>
  );

  React.useEffect(
    () => () => {
      setIsLoading(false);
      setErrorText(undefined);
    },
    [setIsLoading, setErrorText]
  );

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
      errorText={errorText}
      formSubmitHandler={onConfirm}
    />
  );
};

export default ConfirmationDialog;
