import React from 'react';
import { Paper, PaperProps, withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/PopUpMenuByHover/PopUpMenuByHoverStyles';

interface AppTabsProps extends StylesType, Omit<PaperProps, 'classes'> {
  className?: string;
  color?: 'light' | 'dark';
  contentForHover: JSX.Element;
}

const PopUpMenuByHover: React.FC<AppTabsProps> = ({
  classes,
  className,
  color = 'light',
  contentForHover,
  children,
}) => {
  const paperRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [renderPopUp, setRenderPopUp] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (containerRef.current && containerRef.current.firstElementChild) {
      const { scrollWidth } = containerRef.current.firstElementChild;
      const { clientWidth } = containerRef.current.firstElementChild;
      const { textOverflow } = getComputedStyle(
        containerRef.current.firstElementChild
      );
      if (textOverflow !== 'ellipsis') setRenderPopUp(true);
      if (scrollWidth > clientWidth) setRenderPopUp(true);
    }
  }, [containerRef]);

  const mouseHandler = (e: React.MouseEvent) => {
    if (e.currentTarget.parentElement && paperRef.current) {
      const currentTargetParentRect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.pageX - currentTargetParentRect.width;
      const offsetY = e.pageY - currentTargetParentRect.top;
      if (offsetX > 0 && e.currentTarget.clientWidth > 40) {
        paperRef.current.style.left = `${offsetX + 15}px`;
      } else {
        paperRef.current.style.left = `${e.pageX}px`;
      }

      if (offsetY > 0) {
        paperRef.current.style.top = `${offsetY + 20}px`;
      } else {
        paperRef.current.style.top = `${35}px`;
      }
    }
  };

  return (
    <div
      className={classes.container}
      ref={containerRef}
      onMouseEnter={mouseHandler}
    >
      {contentForHover}
      {renderPopUp && (
        <Paper
          ref={paperRef}
          className={cx(className, classes.childrenContainer, {
            [classes.dark]: color === 'dark',
          })}
        >
          {children}
        </Paper>
      )}
    </div>
  );
};
export default withStyles(styles)(PopUpMenuByHover);
