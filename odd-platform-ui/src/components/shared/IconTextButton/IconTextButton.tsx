import React from 'react';
import cx from 'classnames';
import { withStyles, ButtonBase } from '@material-ui/core';
import AddIcon from 'components/shared/Icons/AddIcon';
import { styles, StylesType } from './IconTextButtonStyles';

interface IconTextButtonProps extends StylesType {
  onClick: () => void;
  buttonText?: string;
  transparent?: boolean;
}

const IconTextButton: React.FC<IconTextButtonProps> = ({
  classes,
  onClick,
  buttonText,
  transparent = false,
}) => (
  <ButtonBase
    className={cx(classes.container, {
      [classes.transparent]: transparent,
      [classes.withoutText]: !buttonText,
    })}
    onClick={onClick}
    disableRipple
  >
    <AddIcon className={classes.icon} />
    {buttonText && <div className={classes.text}>{buttonText}</div>}
  </ButtonBase>
);

export default withStyles(styles)(IconTextButton);
