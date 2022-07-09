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
  renderActions?: (actionsProps: {
    handleOpen: () => void;
    handleClose: () => void;
  }) => JSX.Element;
  handleCloseSubmittedForm?: boolean;
  isLoading?: boolean;
  errorText?: string;
  dialogContentId?: string;
  clearState?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'xl';
  formSubmitHandler?: any;
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
  formSubmitHandler,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpen = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setOpen(true);
    },
    [setOpen]
  );
  const handleClose = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setOpen(false);
      if (clearState) {
        clearState();
      }
    },
    [setOpen]
  );

  React.useEffect(() => {
    handleClose();
  }, [handleCloseSubmittedForm, handleClose]);

  const dialogOnKeyDownHandler = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey && formSubmitHandler) {
      event.preventDefault();

      formSubmitHandler();
    }
  };

  return (
    <>
      {renderOpenBtn({ handleOpen, handleClose })}
      {open ? (
        <S.MainDialog
          $isLoading={isLoading}
          open={open}
          onClose={(e: React.MouseEvent) => handleClose(e)}
          fullWidth
          maxWidth={maxWidth}
          scroll={scroll}
          aria-labelledby="max-width-dialog-title"
          onKeyDown={dialogOnKeyDownHandler}
        >
          <S.Progress color="primary" $isLoading={isLoading} />
          <S.Title $isLoading={isLoading} id="max-width-dialog-title">
            {title}
            <AppIconButton
              sx={{ ml: 1 }}
              size="small"
              color="unfilled"
              icon={<ClearIcon />}
              onClick={handleClose}
            />
          </S.Title>
          <S.Content id={dialogContentId}>
            {renderContent({ handleOpen, handleClose })}
          </S.Content>
          <S.Actions disableSpacing>
            {errorText && (
              <S.ErrorText variant="subtitle2" color="error">
                {errorText}
              </S.ErrorText>
            )}
            {renderActions && renderActions({ handleOpen, handleClose })}
          </S.Actions>
        </S.MainDialog>
      ) : null}
    </>
  );
};

export default DialogWrapper;
