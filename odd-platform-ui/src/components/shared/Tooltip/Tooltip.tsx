import React from 'react';
import withStyles from '@mui/styles/withStyles';
import ReactTooltip, { TooltipProps } from 'react-tooltip';
import cx from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { styles, StylesType } from './TooltipStyles';

interface CustomTooltipProps
  extends StylesType,
    Omit<TooltipProps, 'type'> {
  className?: string;
  tooltipContent: string | JSX.Element | undefined;
  type?: 'light' | 'dark';
  tooltipControl?: 'byClick' | 'byHover';
  overflowCheck?: boolean;
}

const Tooltip: React.FC<CustomTooltipProps> = ({
  classes,
  className,
  tooltipContent,
  children,
  type = 'light',
  tooltipControl = 'byHover',
  overflowCheck = true,
  ...props
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
    () => tooltipControl === 'byClick',
    [tooltipControl]
  );

  return (
    <div className={classes.container}>
      {hasOverflow || controlChecker || !overflowCheck ? (
        <ReactTooltip
          {...props} // eslint-disable-line react/jsx-props-no-spreading
          id={id}
          type={type}
          clickable={controlChecker}
          globalEventOff="click"
        >
          {tooltipContent}
        </ReactTooltip>
      ) : null}
      <div
        className={cx(classes.childrenContainer, {
          [classes.cursor]: hasOverflow || !overflowCheck,
        })}
        data-for={id}
        data-tip
        data-event={controlChecker ? 'click' : null}
        ref={childrenRef}
      >
        {children}
      </div>
    </div>
  );
};

export default withStyles(styles)(Tooltip);
