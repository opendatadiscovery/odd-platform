import React from 'react';
import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import AppButton from 'components/shared/AppButton/AppButton';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { styles, StylesType } from './TagItemStyles';

interface TagItemProps extends StylesType {
  label: string;
  important?: boolean;
  removable?: boolean;
  onRemoveClick?: () => void;
  onClick?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({
  classes,
  label,
  important,
  removable,
  onRemoveClick = () => {},
  onClick,
}) => (
  <Typography
    variant="body1"
    className={cx(classes.container, {
      [classes.important]: important,
      [classes.containerRemovable]: removable,
    })}
    onClick={onClick}
  >
    {label}
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

export default withStyles(styles)(TagItem);
