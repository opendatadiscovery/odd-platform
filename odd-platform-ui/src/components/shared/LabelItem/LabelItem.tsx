import React from 'react';
import { Typography, withStyles } from '@material-ui/core';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import cx from 'classnames';
import { styles, StylesType } from './LabelItemStyles';

interface LabelItemProps extends StylesType {
  labelName: string;
  removable?: boolean;
  onRemoveClick?: () => void;
  unfilled?: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
  classes,
  labelName,
  removable,
  onRemoveClick,
  unfilled,
}) => (
  <Typography
    noWrap
    variant="body2"
    title={labelName}
    className={cx(classes.container, { [classes.unfilled]: unfilled })}
  >
    {labelName}
    {removable && (
      <AppButton
        className={classes.removeBtn}
        size="small"
        color="unfilled"
        icon={<CancelIcon />}
        onClick={onRemoveClick}
      />
    )}
  </Typography>
);

export default withStyles(styles)(LabelItem);
