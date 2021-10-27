import React from 'react';
import ReactTooltip, { TooltipProps } from 'react-tooltip';
import { v4 as uuidv4 } from 'uuid';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';
import * as S from './AppTooltipStyles';

interface AppTooltipProps extends Pick<TooltipProps, 'place' | 'offset'> {
  title: string | JSX.Element | undefined;
  type?: 'light' | 'dark';
  control?: 'byClick' | 'byHover';
  overflowCheck?: boolean;
  place?: TooltipProps['place'];
  maxWidth?: number;
  sx?: SxProps<Theme>;
}

const AppTooltip: React.FC<AppTooltipProps> = ({
  title,
  children,
  type = 'light',
  control = 'byHover',
  overflowCheck = true,
  place = 'bottom',
  offset,
  maxWidth,
  sx,
}) => {
  const tagList = ['svg'];

  const childrenRef = React.useRef<HTMLDivElement>(null);
  const [hasOverflow, setOverflow] = React.useState<boolean>(false);

  const id = uuidv4();

  React.useEffect(() => {
    if (overflowCheck && childrenRef.current?.firstElementChild) {
      const el = childrenRef.current.firstElementChild;
      const { scrollWidth, clientWidth } = el;

      if (
        (!hasOverflow && scrollWidth > clientWidth) ||
        tagList.includes(el.tagName)
      ) {
        setOverflow(true);
      }
    }
  }, [childrenRef, hasOverflow, children, overflowCheck]);

  const controlChecker = React.useMemo<boolean>(
    () => control === 'byClick',
    [control]
  );

  return (
    <S.Container $maxWidth={maxWidth} sx={sx}>
      {hasOverflow || controlChecker || !overflowCheck ? (
        <ReactTooltip
          id={id}
          type={type}
          clickable={controlChecker}
          globalEventOff="click"
          place={place}
          eventOff="mouseleave"
          offset={
            offset ||
            (control === 'byClick'
              ? { right: 60, top: 25 }
              : { right: 60 })
          }
        >
          {title}
        </ReactTooltip>
      ) : null}
      <S.ChildrenContainer
        $isPointer={hasOverflow || !overflowCheck}
        data-for={id}
        data-tip
        data-event={controlChecker ? 'click' : null}
        ref={childrenRef}
      >
        {children}
      </S.ChildrenContainer>
    </S.Container>
  );
};

export default AppTooltip;
