import React from 'react';
import {
  withStyles,
  IconButton,
  IconButtonProps,
} from '@material-ui/core';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import cx from 'classnames';
import { styles, StylesType } from './ClearSearchButtonStyles';

interface ClearSearchButtonProps extends StylesType {
  onClick: () => void;
  size?: IconButtonProps['size'];
  className?: IconButtonProps['className'];
}

const ClearSearchButton: React.FC<ClearSearchButtonProps> = ({
  classes,
  size,
  className,
  onClick,
}) => (
  <IconButton
    className={cx(classes.container, className)}
    onClick={onClick}
    disableRipple
    size={size}
  >
    <CancelIcon className={classes.icon} />
  </IconButton>
);

export default withStyles(styles)(ClearSearchButton);
