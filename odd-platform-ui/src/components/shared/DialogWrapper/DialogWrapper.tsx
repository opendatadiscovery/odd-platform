import React from 'react';
import { DialogProps } from '@mui/material';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import {
  ErrorText,
  StyledDialog,
  StyledDialogActions,
  StyledDialogContent,
  StyledDialogTitle,
  StyledProgress,
  closeButton,
} from './DialogWrapperStyles';

interface DialogWrapperProps extends Omit<DialogProps, 'title' | 'open'> {
  renderOpenBtn(openBtnProps: {
    handleOpen: () => void;
    handleClose: () => void;
  }): JSX.Element;
  title: JSX.Element | string;
  renderContent: (actionsProps: {
    handleClose: () => void;
    handleOpen: () => void;
  }) => JSX.Element;
  renderActions(actionsProps: { handleOpen: () => void }): JSX.Element;
  handleCloseSubmittedForm?: boolean;
  isLoading?: boolean;
  errorText?: string;
  dialogContentId?: string;
  clearState?: () => void;
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  renderOpenBtn,
  title,
  renderContent,
  renderActions,
  handleCloseSubmittedForm,
  scroll = 'paper',
  maxWidth = 'xs',
  isLoading,
  errorText,
  dialogContentId,
  clearState,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpen = React.useCallback(() => setOpen(true), [setOpen]);
  const handleClose = React.useCallback(() => setOpen(false), [setOpen]);

  React.useEffect(() => {
    handleClose();
  }, [handleCloseSubmittedForm]);

  return (
    <>
      {renderOpenBtn({ handleOpen, handleClose })}
      {open ? (
        <StyledDialog
          $isLoading={isLoading}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth={maxWidth}
          scroll={scroll}
          aria-labelledby="max-width-dialog-title"
        >
          <StyledProgress color="primary" $isLoading={isLoading} />
          <StyledDialogTitle
            $isLoading={isLoading}
            id="max-width-dialog-title"
          >
            {title}
            <AppIconButton
              sx={closeButton}
              size="small"
              color="unfilled"
              icon={<ClearIcon />}
              onClick={() => {
                if (clearState) {
                  clearState();
                }
                handleClose();
              }}
            />
          </StyledDialogTitle>
          <StyledDialogContent id={dialogContentId}>
            {renderContent({ handleOpen, handleClose })}
          </StyledDialogContent>
          <StyledDialogActions disableSpacing>
            {errorText && (
              <ErrorText variant="subtitle2" color="error">
                {errorText}
              </ErrorText>
            )}
            {renderActions({ handleOpen })}
          </StyledDialogActions>
        </StyledDialog>
      ) : null}
    </>
  );
};

export default DialogWrapper;
