import React from 'react';
import cx from 'classnames';
import { withStyles } from '@material-ui/core';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import { DatasetTypeLabelMap } from 'redux/interfaces/datasetStructure';
import {
  StylesType,
  styles,
} from './DatasetStructureFieldTypeLabelStyles';

interface DatasetStructureFieldTypeLabelProps extends StylesType {
  type: DataSetFieldTypeTypeEnum;
}

const DatasetStructureFieldTypeLabel: React.FC<DatasetStructureFieldTypeLabelProps> = ({
  classes,
  type,
}) => (
  <span className={cx(classes.container, type)}>
    {DatasetTypeLabelMap.get(type)?.short}
  </span>
);

export default withStyles(styles)(DatasetStructureFieldTypeLabel);
