import React from 'react';
import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import { styles, StylesType } from './ConfirmationDialogStyles';

interface ConfirmationDialogProps extends StylesType {
  actionBtn: JSX.Element;
  actionTitle: string;
  actionText: JSX.Element | string;
  actionName: string;
  onConfirm: () => Promise<unknown>;
  onCancel?: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  classes,
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

  const formTitle = <Typography variant="h4">{actionTitle}</Typography>;

  const formContent = () => (
    <Typography variant="subtitle1">{actionText}</Typography>
  );

  const formActionButtons = () => (
    <div className={classes.actions}>
      <AppButton2
        size="large"
        color="primary"
        onClick={onClose(onConfirm)}
      >
        {actionName}
      </AppButton2>
    </div>
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

export default withStyles(styles)(ConfirmationDialog);
