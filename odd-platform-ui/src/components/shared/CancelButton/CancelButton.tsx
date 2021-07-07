import React from 'react';
import { withStyles, Button, ButtonProps } from '@material-ui/core';
import { styles, StylesType } from './CancelButtonStyles';

interface CancelButtonProps
  extends StylesType,
    Omit<ButtonProps, 'classes'> {
  onClick: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({
  classes,
  onClick,
  ...props
}) => (
  <Button
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    className={classes.container}
    onClick={onClick}
  >
    Cancel
  </Button>
);

export default withStyles(styles)(CancelButton);
