import React from 'react';
import { withStyles, Button, ButtonProps } from '@material-ui/core';
import cx from 'classnames';
import { styles, StylesType } from './SaveButtonStyles';

interface SaveButtonProps
  extends StylesType,
    Omit<ButtonProps, 'classes'> {
  onClick: () => void;
  label?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  classes,
  label,
  ...props
}) => {
  const { disabled } = props;
  return (
    <Button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={cx({
        [classes.container]: true,
        [classes.disabled]: disabled,
      })}
    >
      {label || 'Save'}
    </Button>
  );
};

export default withStyles(styles)(SaveButton);
