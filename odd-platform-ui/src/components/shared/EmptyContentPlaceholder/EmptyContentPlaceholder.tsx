import React from 'react';
import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import EmptyIcon from 'components/shared/Icons/EmptyIcon';
import {
  styles,
  StylesType,
} from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholderStyles';

interface EmptyContentPlaceholderProps extends StylesType {
  text?: string;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  classes,
  text = 'No content',
}) => (
  <Typography variant="subtitle2" className={classes.container}>
    <EmptyIcon className={classes.icon} />
    {text}
  </Typography>
);

export default withStyles(styles)(EmptyContentPlaceholder);
