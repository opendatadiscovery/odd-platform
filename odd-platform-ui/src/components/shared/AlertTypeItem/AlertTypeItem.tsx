import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/AlertTypeItem/AlertTypeItemStyles';
import { AlertStatus } from 'generated-sources';
import { toTitleCase } from 'lib/helpers';

interface AlertTypeItemProps extends StylesType {
  className?: string;
  typeName: AlertStatus;
}

const AlertTypeItem: React.FC<AlertTypeItemProps> = ({
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

export default withStyles(styles)(AlertTypeItem);
