import React from 'react';
import {
  withStyles,
  IconButton,
  IconButtonProps,
  Button,
  ButtonProps,
} from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/AppButton/AppButtonStyles';

interface AppButtonProps
  extends Omit<ButtonProps, 'size' | 'color' | 'classes'>,
    Omit<IconButtonProps, 'size' | 'color' | 'classes'>,
    StylesType {
  icon?: React.ReactNode;
  disabled?: boolean;
  size: 'large' | 'medium' | 'small';
  color:
    | 'primary'
    | 'primaryLight'
    | 'secondary'
    | 'tertiary'
    | 'dropdown'
    | 'expand'
    | 'unfilled';
}

const AppButton: React.FC<AppButtonProps> = ({
  children,
  classes,
  className,
  onClick,
  icon,
  disabled,
  size,
  color,
  ...props
}) =>
  icon && !children && size !== 'large' ? (
    <IconButton
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={cx(classes[color], className)}
      onClick={onClick}
      disableRipple
      disabled={disabled}
      size={size}
    >
      {icon}
    </IconButton>
  ) : (
    <Button
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      className={cx(classes[color], className)}
      onClick={onClick}
      disableRipple
      startIcon={color !== 'dropdown' ? icon : null}
      endIcon={color === 'dropdown' ? icon : null}
      disabled={disabled}
      size={size}
    >
      {children}
    </Button>
  );

export default withStyles(styles)(AppButton);
