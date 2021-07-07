import React from 'react';
import {
  ClickAwayListener,
  Paper,
  PaperProps,
  withStyles,
} from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/PopUpMenuByClick/PopUpMenuByClickStyles';

interface AppTabsProps extends StylesType, Omit<PaperProps, 'classes'> {
  className?: string;
  renderOpeningContent: (openingContentProps: {
    toggleOpen: () => void;
  }) => JSX.Element;
  renderChildren: (childrenProps: {
    handleClose: () => void;
  }) => JSX.Element;
}

const PopUpMenuByClick: React.FC<AppTabsProps> = ({
  classes,
  className,
  renderOpeningContent,
  renderChildren,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const toggleOpen = React.useCallback(() => setOpen(prev => !prev), [
    setOpen,
  ]);
  const handleClose = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div className={classes.container}>
        {renderOpeningContent({ toggleOpen })}
        <Paper
          onMouseLeave={handleClose}
          className={cx(className, classes.menu, {
            [classes.menuOpened]: open,
          })}
        >
          {renderChildren({ handleClose })}
        </Paper>
      </div>
    </ClickAwayListener>
  );
};
export default withStyles(styles)(PopUpMenuByClick);
