import type { HTMLAttributeAnchorTarget } from 'react';
import React, { useMemo } from 'react';
import type { SxProps, Theme } from '@mui/system';
import { StyledButton, Loader, Icon, StyledLink, Text } from './Button.styles';
import type { ButtonColor, ButtonSize, Button as ButtonType } from './interfaces';

export interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  buttonType: ButtonType;
  to?: string | object;
  sx?: SxProps<Theme>;
  isLoading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  text?: string;
  target?: HTMLAttributeAnchorTarget;
}

const Button: React.FC<Props> = ({
  to,
  type = 'button',
  text,
  sx,
  buttonType,
  isLoading,
  startIcon,
  icon,
  endIcon,
  fullWidth,
  target,
  ...props
}) => {
  const [color, size] = buttonType.split('-') as [ButtonColor, ButtonSize];

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
  }, [isLoading, startIcon, endIcon, text, icon]);

  if (to) {
    return (
      <StyledLink sx={sx} to={to} target={target} $disabled={props.disabled}>
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
