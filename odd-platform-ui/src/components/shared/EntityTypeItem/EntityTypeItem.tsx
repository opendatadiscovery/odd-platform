import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import { DataEntityType } from 'generated-sources';
import { DataEntityTypeLabelMap } from 'redux/interfaces/dataentities';
import { styles, StylesType } from './EntityTypeItemStyles';

interface EntityTypeItemProps extends StylesType {
  className?: string;
  typeName: DataEntityType['name'];
  fullName?: boolean;
}

const EntityTypeItem: React.FC<EntityTypeItemProps> = ({
  classes,
  className,
  typeName,
  fullName,
}) => (
  <span
    className={cx(classes.container, className, typeName, {
      [classes.containerSmall]: fullName,
    })}
    title={DataEntityTypeLabelMap.get(typeName)?.normal}
  >
    {DataEntityTypeLabelMap.get(typeName)?.[fullName ? 'normal' : 'short']}
  </span>
);

export default withStyles(styles)(EntityTypeItem);
