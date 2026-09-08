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
  // truncated label) get the shared card body automatically when they are handed a plain string, so a call site
  // cannot reintroduce the bare edge-to-edge row (LSN-035, and its 2026-09 repeat on the Last-viewed facet) by
  // omission. LIGHT type only: the body is a light card — padding, a light border, a shadow, a 360px wrap width —
  // and drawn inside the dark chip it doubles the chip's height and paints a light border on a dark background,
  // which is what the first cut of this did to the "Logical type: X" hint on every dataset-structure row. A caller
  // that passes an element (its own TooltipBody, a rich node) is untouched and keeps whatever width it declared.
  // Of the fifteen `checkForOverflow={false}` call sites, three hand over a plain string — FavoritesFilter (light,
  // served here) and DatasetStructureItem + LinkedColumn (dark, left alone); the other twelve pass elements.
  const body =
    type === 'light' &&
    !checkForOverflow &&
    (typeof title === 'string' || typeof title === 'number') ? (
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
