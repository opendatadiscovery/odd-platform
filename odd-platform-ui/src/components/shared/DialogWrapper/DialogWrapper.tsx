import React from 'react';
import cx from 'classnames';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import AppButton from 'components/shared/AppButton/AppButton';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { styles, StylesType } from './DialogWrapperStyles';

interface DialogWrapperProps
  extends Omit<DialogProps, 'title' | 'open' | 'classes'>,
    StylesType {
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
  classes,
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
        <Dialog
          className={cx(
            classes.container,
            isLoading ? classes.loading : ''
          )}
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth={maxWidth}
          scroll={scroll}
          aria-labelledby="max-width-dialog-title"
        >
          <LinearProgress color="secondary" className={classes.spinner} />
          <DialogTitle
            className={classes.title}
            id="max-width-dialog-title"
          >
            {title}
            <AppButton
              size="small"
              color="unfilled"
              icon={<CancelIcon />}
              onClick={() => {
                if (clearState) {
                  clearState();
                }
                handleClose();
              }}
            />
          </DialogTitle>
          <DialogContent className={classes.content} id={dialogContentId}>
            {renderContent({ handleOpen, handleClose })}
          </DialogContent>
          <DialogActions className={classes.actions} disableSpacing>
            {errorText && (
              <Typography
                className={classes.error}
                variant="subtitle2"
                color="error"
              >
                {errorText}
              </Typography>
            )}
            {renderActions({ handleOpen })}
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};

export default withStyles(styles)(DialogWrapper);
