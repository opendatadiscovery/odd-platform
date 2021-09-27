import React from 'react';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import { capitalize } from 'lodash';
import {
  styles,
  StylesType,
} from 'components/shared/AlertStatusItem/AlertStatusItemStyles';
import { AlertStatus } from 'generated-sources';

interface AlertStatusItemProps extends StylesType {
  className?: string;
  typeName: AlertStatus;
}

const AlertStatusItem: React.FC<AlertStatusItemProps> = ({
  className,
  typeName,
  classes,
}) => (
  <div className={cx(classes.container, className)} title={typeName}>
    <span className={cx(classes.filledContainer, typeName)}>
      {capitalize(typeName)}
    </span>
  </div>
);

export default withStyles(styles)(AlertStatusItem);
