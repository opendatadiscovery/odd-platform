import React from 'react';
import { PopoverProps } from '@mui/material';
import * as S from './AppPopoverStyles';

interface AppPopoverProps extends Omit<PopoverProps, 'open'> {
  renderOpenBtn: (props: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaDescribedBy: string | undefined;
  }) => React.ReactElement;
}

const AppPopover: React.FC<AppPopoverProps> = ({
  children,
  anchorOrigin,
  renderOpenBtn,
  sx,
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
    <div>
      {renderOpenBtn({ onClick: handleClick, ariaDescribedBy: id })}
      <S.AppPopover
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        sx={sx}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        disableRestoreFocus
      >
        {children}
      </S.AppPopover>
    </div>
  );
};
export default AppPopover;
