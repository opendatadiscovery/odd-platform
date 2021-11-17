import React from 'react';
import { TooltipProps } from '@mui/material';
import * as S from 'components/shared/AppMuiTooltip/AppMuiTooltipStyles';

interface AppMuiTooltipProps
  extends Pick<
    TooltipProps,
    'placement' | 'children' | 'followCursor' | 'sx'
  > {
  title: (props: {
    open?: boolean;
  }) => React.ReactElement | string | undefined;
  type?: S.TooltipColorTypes;
  maxWidth?: number;
  checkForOverflow?: boolean;
}

const AppMuiTooltip: React.FC<AppMuiTooltipProps> = ({
  placement = 'bottom-start',
  children,
  followCursor = true,
  title,
  type = 'light',
  maxWidth = 320,
  checkForOverflow = true,
  sx,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const [hoverStatus, setHover] = React.useState<boolean>(true);
  const childrenRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (checkForOverflow && childrenRef.current?.firstElementChild) {
      const el = childrenRef.current.firstElementChild;
      const { scrollWidth, clientWidth } = el;
      setHover(!hoverStatus && scrollWidth > clientWidth);
    }
  }, [childrenRef, childrenRef.current, setHover]);

  return (
    <S.AppTooltip
      $maxWidth={maxWidth}
      $type={type}
      title={title({ open }) || ''}
      placement={placement}
      followCursor={followCursor}
      disableInteractive
      disableHoverListener={!hoverStatus}
      sx={sx}
    >
      <S.ChildrenContainer
        onMouseEnter={() => {
          if (hoverStatus) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        $isCursorPointer={hoverStatus}
        ref={childrenRef}
      >
        {children}
      </S.ChildrenContainer>
    </S.AppTooltip>
  );
};
export default AppMuiTooltip;
