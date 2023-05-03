import React from 'react';
import { type DialogProps } from '@mui/material';
import ClearIcon from 'components/shared/icons/ClearIcon';
import * as S from 'components/shared/elements/DialogWrapper/DialogWrapperStyles';
import Button from 'components/shared/elements/Button/Button';

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
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  formSubmitHandler?: () => Promise<unknown>;
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
  const [open, setOpen] = React.useState(false);

  const handleOpen = React.useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpen(true);
  }, []);
  const handleClose = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
    if (clearState) {
      clearState();
    }
  }, []);

  React.useEffect(() => {
    handleClose();
  }, [handleCloseSubmittedForm, handleClose]);

  const dialogOnKeyDownHandler = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && formSubmitHandler) {
      event.preventDefault();
      await formSubmitHandler();
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
          aria-labelledby='max-width-dialog-title'
          onKeyDown={dialogOnKeyDownHandler}
        >
          <S.Progress color='primary' $isLoading={isLoading} />
          <S.Title $isLoading={isLoading} id='max-width-dialog-title'>
            {title}
            <Button
              sx={{ ml: 1 }}
              buttonType='linkGray-m'
              icon={<ClearIcon />}
              onClick={handleClose}
            />
          </S.Title>
          <S.Content id={dialogContentId}>
            {renderContent({ handleOpen, handleClose })}
          </S.Content>
          <S.Actions disableSpacing>
            {errorText && (
              <S.ErrorText variant='subtitle2' color='error'>
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
