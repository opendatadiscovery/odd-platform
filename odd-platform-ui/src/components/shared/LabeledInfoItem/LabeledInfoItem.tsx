import React from 'react';
import {
  Grid,
  Typography,
  TypographyProps,
  GridSize,
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import { styles, StylesType } from './LabeledInfoItemStyles';

interface LabeledInfoItemProps extends StylesType {
  inline?: boolean;
  label: string;
  variant?: TypographyProps['variant'];
  labelWidth?: GridSize;
}

const LabeledInfoItem: React.FC<LabeledInfoItemProps> = ({
  classes,
  inline,
  label,
  variant = 'body1',
  children,
  labelWidth,
}) => (
  <Grid
    container
    className={cx(classes.container, { [classes.inline]: inline })}
  >
    <Grid item xs={labelWidth || 'auto'}>
      <Typography variant={variant} className={classes.label} noWrap>
        {label}
      </Typography>
    </Grid>
    <Grid
      item
      xs={
        typeof labelWidth === 'number'
          ? ((12 - labelWidth) as GridSize)
          : 'auto'
      }
    >
      <Typography variant={variant} className={classes.value} noWrap>
        {children}
      </Typography>
    </Grid>
  </Grid>
);

export default withStyles(styles)(LabeledInfoItem);
