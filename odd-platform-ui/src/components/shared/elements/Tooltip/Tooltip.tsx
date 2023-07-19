import type { PropsWithChildren, ReactElement } from 'react';
import React, { type FC, useEffect, useRef, useState } from 'react';
import * as S from './Tooltip.styles';

interface TooltipProps extends PropsWithChildren {
  content: ReactElement;
  direction?: S.Direction;
}

const Tooltip: FC<TooltipProps> = ({ content, direction = 'bottom', children }) => {
  const [active, setActive] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      node.addEventListener('mouseover', () => setActive(true));
      node.addEventListener('mouseout', () => setActive(false));

      return () => {
        node.removeEventListener('mouseover', () => setActive(true));
        node.removeEventListener('mouseout', () => setActive(false));
      };
    }
  }, []);

  return (
    <S.Container ref={nodeRef}>
      {children}
      <S.Tooltip
        $direction={direction}
        $active={active}
        style={{ opacity: active ? 1 : 0, visibility: active ? 'visible' : 'hidden' }}
      >
        {content}
      </S.Tooltip>
    </S.Container>
  );
};

export default Tooltip;
