import React from 'react';
import { DialogProps } from '@mui/material';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import * as S from './DialogWrapperStyles';

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
        <S.Container
          $isLoading={isLoading}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth={maxWidth}
          scroll={scroll}
          aria-labelledby="max-width-dialog-title"
        >
          <S.Loader color="primary" $isLoading={isLoading} />
          <S.Title $isLoading={isLoading} id="max-width-dialog-title">
            {title}
            <AppIconButton
              sx={{ ml: 1 }}
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
          </S.Title>
          <S.Content id={dialogContentId}>
            {renderContent({ handleOpen, handleClose })}
          </S.Content>
          <S.Actions disableSpacing>
            {errorText && (
              <S.ErrorText
                variant="subtitle2"
                color="error"
                sx={{ mb: 1 }}
              >
                {errorText}
              </S.ErrorText>
            )}
            {renderActions({ handleOpen })}
          </S.Actions>
        </S.Container>
      ) : null}
    </>
  );
};

export default DialogWrapper;
