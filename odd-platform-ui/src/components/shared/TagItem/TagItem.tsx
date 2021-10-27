import React from 'react';
import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
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
      <AppIconButton
        size="small"
        color="unfilled"
        icon={<ClearIcon />}
        onClick={onRemoveClick}
        sx={{ ml: 0.25 }}
      />
    )}
  </Typography>
);

export default withStyles(styles)(TagItem);
