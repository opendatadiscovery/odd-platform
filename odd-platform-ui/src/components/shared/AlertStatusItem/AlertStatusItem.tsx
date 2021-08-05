import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/AlertStatusItem/AlertStatusItemStyles';
import { AlertStatus } from 'generated-sources';
import { toTitleCase } from 'lib/helpers';

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
      {toTitleCase(typeName)}
    </span>
  </div>
);

export default withStyles(styles)(AlertStatusItem);
