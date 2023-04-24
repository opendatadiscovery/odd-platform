import React, { useMemo } from 'react';
import type { SxProps, Theme } from '@mui/system';
import {
  type ButtonColor,
  type ButtonSize,
  StyledButton,
  Loader,
  Icon,
  StyledLink,
  Text,
} from './Button.styles';

export interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color: ButtonColor;
  size: ButtonSize;
  to?: string | object;
  sx?: SxProps<Theme>;
  isLoading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  text?: string;
}

export const Button: React.FC<Props> = ({
  to,
  type = 'button',
  text,
  sx,
  size,
  color,
  isLoading,
  startIcon,
  icon,
  endIcon,
  fullWidth,
  ...props
}) => {
  const content = useMemo(() => {
    if (isLoading) return <Loader $color={color} />;
    if (icon) return <Icon $size={size}>{icon}</Icon>;

    return (
      <>
        {startIcon ? (
          <Icon $start={!!startIcon} $size={size}>
            {startIcon}
          </Icon>
        ) : null}
        {text ? <Text>{text}</Text> : null}
        {endIcon ? (
          <Icon $end={!!endIcon} $size={size}>
            {endIcon}
          </Icon>
        ) : null}
      </>
    );
  }, [isLoading, startIcon, endIcon, text]);

  if (to) {
    return (
      <StyledLink sx={sx} to={to} $disabled={props.disabled}>
        <StyledButton
          $iconButton={!!icon}
          $size={size}
          $color={color}
          $fullWidth={fullWidth}
          type={type}
          {...props}
        >
          {content}
        </StyledButton>
      </StyledLink>
    );
  }
  return (
    <StyledButton
      $iconButton={!!icon}
      sx={sx}
      $size={size}
      $color={color}
      $fullWidth={fullWidth}
      type={type}
      {...props}
    >
      {content}
    </StyledButton>
  );
};

export default Button;
