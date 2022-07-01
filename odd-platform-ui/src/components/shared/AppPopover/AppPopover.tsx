import React from 'react';
import { Box, PopoverProps, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import * as S from './AppPopoverStyles';

interface AppPopoverProps extends Omit<PopoverProps, 'open'> {
  renderOpenBtn: (props: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaDescribedBy: string | undefined;
  }) => React.ReactElement;
  childrenSx?: SxProps<Theme>;
}

const AppPopover: React.FC<AppPopoverProps> = ({
  children,
  anchorOrigin,
  renderOpenBtn,
  sx,
  childrenSx,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

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
        <Box sx={childrenSx}>{children}</Box>
      </S.AppPopover>
    </>
  );
};
export default AppPopover;
