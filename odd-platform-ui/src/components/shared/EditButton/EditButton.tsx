import React from 'react';
import {
  withStyles,
  IconButton,
  IconButtonProps,
} from '@material-ui/core';
import cx from 'classnames';
import EditIcon from 'components/shared/Icons/EditIcon';
import { styles, StylesType } from './EditButtonStyles';

interface EditButtonProps extends StylesType {
  onClick: () => void;
  size?: IconButtonProps['size'];
  className?: IconButtonProps['className'];
}

const EditButton: React.FC<EditButtonProps> = React.forwardRef(
  ({ classes, className, onClick, ...props }, ref) => (
    <IconButton
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={cx(classes.container, className)}
      onClick={onClick}
      disableRipple
      buttonRef={ref}
    >
      <EditIcon className={classes.icon} />
    </IconButton>
  )
);

export default withStyles(styles)(EditButton);
