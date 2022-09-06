import React, { HTMLAttributeAnchorTarget } from 'react';
import { ButtonProps } from '@mui/material';
import { Link } from 'react-router-dom';
import { ButtonColors, StyledAppButton } from './AppButtonStyles';

interface AppButtonProps
  extends Pick<
    ButtonProps,
    | 'size'
    | 'onClick'
    | 'sx'
    | 'startIcon'
    | 'endIcon'
    | 'fullWidth'
    | 'disabled'
    | 'type'
    | 'form'
    | 'autoFocus'
    | 'id'
    | 'ref'
    | 'children'
    | 'itemRef'
  > {
  color: ButtonColors;
  to?: string | object;
  truncate?: boolean;
  linkTarget?: HTMLAttributeAnchorTarget;
}

const AppButton: React.FC<AppButtonProps> = React.forwardRef(
  ({ color, children, truncate, to, linkTarget, ...props }, ref) => {
    const [isOverflowed, setIsOverflowed] = React.useState(truncate);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      const element = buttonRef.current;
      if (element) {
        const { scrollWidth, clientWidth } = element;
        setIsOverflowed(scrollWidth > clientWidth);
      }
    }, [buttonRef.current]);

    if (to) {
      return (
        <Link to={to} style={{ width: 'inherit' }} target={linkTarget}>
          <StyledAppButton
            {...props}
            focusRipple
            $color={color}
            ref={ref || buttonRef}
            disableRipple
            $isOverflowed={isOverflowed}
          >
            {children}
          </StyledAppButton>
        </Link>
      );
    }

    return (
      <StyledAppButton
        {...props}
        focusRipple
        $color={color}
        ref={ref || buttonRef}
        disableRipple
        $isOverflowed={isOverflowed}
      >
        {children}
      </StyledAppButton>
    );
  }
);

export default AppButton;
