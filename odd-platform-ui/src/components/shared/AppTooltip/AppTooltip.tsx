import React from 'react';
import { Theme, TooltipProps } from '@mui/material';
import * as S from 'components/shared/AppTooltip/AppTooltipStyles';
import { SxProps } from '@mui/system';

interface AppTooltipProps
  extends Pick<TooltipProps, 'placement' | 'followCursor' | 'componentsProps'> {
  title: (props: { open?: boolean }) => React.ReactElement | string | undefined;
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
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const [isOverflowed, setIsOverflow] = React.useState(checkForOverflow);
  const childrenRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (childrenRef.current && checkForOverflow) {
      const element = childrenRef.current.firstElementChild || childrenRef.current;
      const { scrollWidth, clientWidth } = element;
      setIsOverflow(scrollWidth > clientWidth);
    }
  }, [childrenRef.current, childrenRef.current?.firstElementChild, checkForOverflow]);

  return (
    <S.AppTooltip
      $type={type}
      title={title({ open }) || ''}
      placement={placement}
      followCursor={followCursor}
      disableInteractive
      disableHoverListener={checkForOverflow ? !isOverflowed : false}
      componentsProps={componentsProps}
    >
      <S.ChildrenContainer
        onMouseEnter={() => {
          if (checkForOverflow ? isOverflowed : true) setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        $isCursorPointer={checkForOverflow ? isOverflowed : true}
        $isOverflowed={isOverflowed}
        ref={childrenRef}
        sx={childSx}
      >
        {children}
      </S.ChildrenContainer>
    </S.AppTooltip>
  );
};
export default AppTooltip;
