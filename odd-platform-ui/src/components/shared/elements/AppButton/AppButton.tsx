import type { HTMLAttributeAnchorTarget } from 'react';
import React from 'react';
import type { ButtonProps } from '@mui/material';
import { Link } from 'react-router-dom';
import type { ButtonColors } from 'components/shared/elements/AppButton/AppButtonStyles';
import {
  Loader,
  StyledAppButton,
} from 'components/shared/elements/AppButton/AppButtonStyles';

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
  isLoading?: boolean;
}

const AppButton: React.FC<AppButtonProps> = React.forwardRef(
  ({ color, children, truncate, to, linkTarget, isLoading, ...props }, ref) => {
    const [isOverflowed, setIsOverflowed] = React.useState(truncate);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      const element = buttonRef.current;
      if (element && !truncate) {
        const { scrollWidth, clientWidth } = element;
        setIsOverflowed(scrollWidth > clientWidth);
      }
    }, [buttonRef]);

    if (to) {
      return (
        <Link
          to={to}
          style={{
            minWidth: 0,
            flex: '0 1 fit-content',
            inlineSize: 'inherit',
            pointerEvents: props.disabled ? 'none' : undefined,
          }}
          target={linkTarget}
        >
          <StyledAppButton
            {...props}
            focusRipple
            $color={color}
            ref={ref || buttonRef}
            disableRipple
            $isOverflowed={isOverflowed}
          >
            {isLoading ? <Loader /> : children}
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
      >
        {isLoading ? <Loader /> : children}
      </StyledAppButton>
    );
  }
);

export default AppButton;
