import React from 'react';
import { TooltipProps } from '@mui/material';
import * as S from 'components/shared/AppTooltip/AppTooltipStyles';

interface AppTooltipProps
  extends Pick<TooltipProps, 'placement' | 'followCursor' | 'sx'> {
  title: (props: {
    open?: boolean;
  }) => React.ReactElement | string | undefined;
  type?: S.TooltipColorTypes;
  maxWidth?: number;
  checkForOverflow?: boolean;
  isOverflowed?: boolean;
  children?: React.ReactNode | React.ReactElement | string;
}

const AppTooltip: React.FC<AppTooltipProps> = ({
  placement = 'bottom-start',
  children,
  followCursor = true,
  title,
  type = 'light',
  maxWidth = 320,
  checkForOverflow = true,
  isOverflowed = true,
  sx,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const [hoverStatus, setHover] = React.useState<boolean>(true);
  const childrenRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (checkForOverflow && childrenRef.current) {
      const el =
        childrenRef.current.firstElementChild || childrenRef.current;
      const { scrollWidth, clientWidth } = el;
      setHover(!hoverStatus && scrollWidth > clientWidth);
    }
  }, [children, childrenRef, childrenRef.current]);

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
        $isOverflowed={isOverflowed}
        ref={childrenRef}
      >
        {children}
      </S.ChildrenContainer>
    </S.AppTooltip>
  );
};
export default AppTooltip;
