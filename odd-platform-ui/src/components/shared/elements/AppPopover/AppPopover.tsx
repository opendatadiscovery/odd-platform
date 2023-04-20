import React from 'react';
import type { PopoverProps, Theme } from '@mui/material';
import { type SxProps } from '@mui/system';
import AppCircularProgress from 'components/shared/elements/AppCircularProgress/AppCircularProgress';
import * as S from 'components/shared/elements/AppPopover/AppPopoverStyles';

interface AppPopoverProps extends Omit<PopoverProps, 'open'> {
  renderOpenBtn: (props: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaDescribedBy: string | undefined;
  }) => React.ReactElement;
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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'appPopover' : undefined;

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
            children
          )}
        </S.PopoverChildren>
      </S.AppPopover>
    </>
  );
};
export default AppPopover;
