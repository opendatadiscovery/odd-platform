import React from 'react';
import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import cx from 'classnames';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
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
    variant="body1"
    title={labelName}
    className={cx(classes.container, { [classes.unfilled]: unfilled })}
  >
    {labelName}
    {removable && (
      <AppIconButton
        sx={{ ml: 0.25 }}
        size="small"
        color="unfilled"
        icon={<CancelIcon />}
        onClick={onRemoveClick}
      />
    )}
  </Typography>
);

export default withStyles(styles)(LabelItem);
