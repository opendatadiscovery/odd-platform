import React from 'react';
import type { PopoverProps, Theme } from '@mui/material';
import { type SxProps } from '@mui/system';
import AppCircularProgress from 'components/shared/elements/AppCircularProgress/AppCircularProgress';
import * as S from 'components/shared/elements/AppPopover/AppPopoverStyles';

/**
 * The popover owns its own open state, so a child that acts IN PLACE — navigates the page underneath,
 * or mutates and then leaves — has no way to dismiss it and the menu stays up on top of the result. That
 * is not only untidy: MUI's Popover is a modal, so while it is open the rest of the page is `aria-hidden`
 * and a screen-reader user is left inside an empty menu (odd-platform#1878 review / PLT-265).
 *
 * `children` may therefore be a RENDER PROP receiving this popover's own `onClose`, mirroring the
 * `renderOpenBtn` idiom directly above rather than inventing a second one. A plain node still works, so
 * every existing call site is unchanged; only a child that needs to close itself opts in.
 */
interface AppPopoverProps extends Omit<PopoverProps, 'open' | 'children'> {
  renderOpenBtn: (props: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaDescribedBy: string | undefined;
  }) => React.ReactElement;
  children?: React.ReactNode | ((props: { onClose: () => void }) => React.ReactNode);
  childrenSx?: SxProps<Theme>;
  isLoading?: boolean;
}

const AppPopover: React.FC<AppPopoverProps> = ({
  children,
  anchorOrigin,
  renderOpenBtn,
  sx,
  childrenSx,
  isLoading,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  // Stable identity: it is handed to the render-prop child, which must not see a new callback every render.
  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const open = Boolean(anchorEl);
  const id = open ? 'appPopover' : undefined;

  const renderChildren = () =>
    typeof children === 'function' ? children({ onClose: handleClose }) : children;

  return (
    <>
      {renderOpenBtn({ onClick: handleClick, ariaDescribedBy: id })}
      <S.AppPopover
        {...props}
        sx={sx}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        disableRestoreFocus
      >
        <S.PopoverChildren sx={childrenSx}>
          {isLoading ? (
            <AppCircularProgress
              size={20}
              background='transparent'
              progressBackground='dark'
            />
          ) : (
            renderChildren()
          )}
        </S.PopoverChildren>
      </S.AppPopover>
    </>
  );
};
export default AppPopover;
