import React, { useEffect, useRef, useState } from 'react';
import type { Theme, TooltipProps } from '@mui/material';
import type { SxProps } from '@mui/system';
import * as S from './AppTooltipStyles';

interface AppTooltipProps extends Pick<
  TooltipProps,
  | 'placement'
  | 'followCursor'
  | 'componentsProps'
  | 'disableHoverListener'
  | 'onOpen'
  | 'onClose'
  | 'sx'
> {
  title: React.ReactElement | string | undefined | number;
  type?: S.TooltipColorTypes;
  checkForOverflow?: boolean;
  children?: React.ReactNode | React.ReactElement | string;
  childSx?: SxProps<Theme>;
}

const AppTooltip: React.FC<AppTooltipProps> = ({
  placement = 'bottom-start',
  children,
  followCursor = true,
  title,
  type = 'light',
  checkForOverflow = true,
  childSx,
  componentsProps,
  disableHoverListener,
  onOpen,
  onClose,
  sx,
}) => {
  const [isOverflowed, setIsOverflow] = useState(checkForOverflow);
  const childrenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (childrenRef.current && checkForOverflow) {
      const element = childrenRef.current.firstElementChild || childrenRef.current;
      const { scrollWidth, clientWidth } = element;
      setIsOverflow(scrollWidth > clientWidth);
    }
  }, [childrenRef.current, childrenRef.current?.firstElementChild, checkForOverflow]);

  // INFORMATIONAL tooltips (`checkForOverflow={false}` — a sentence of help behind an (i), not an echo of a
  // truncated label) get the shared card body automatically when they are handed a plain string. Fifteen call
  // sites passed a bare string and every one of them rendered as an unpadded, background-less, edge-to-edge row
  // — the platform made the wrong thing the easy thing. Doing it HERE means a caller cannot get it wrong, and a
  // caller that already passes an element (its own TooltipBody, a rich node) is untouched.
  const body =
    !checkForOverflow && (typeof title === 'string' || typeof title === 'number') ? (
      <S.TooltipBody data-qa='tooltip-body'>{title}</S.TooltipBody>
    ) : (
      title
    );

  return (
    <S.AppTooltip
      sx={sx}
      $type={type}
      title={body || ''}
      placement={placement}
      followCursor={followCursor}
      disableInteractive
      disableHoverListener={disableHoverListener}
      componentsProps={componentsProps}
      onOpen={onOpen}
      onClose={onClose}
    >
      <S.ChildrenContainer $isOverflowed={isOverflowed} ref={childrenRef} sx={childSx}>
        {children}
      </S.ChildrenContainer>
    </S.AppTooltip>
  );
};
export default AppTooltip;
