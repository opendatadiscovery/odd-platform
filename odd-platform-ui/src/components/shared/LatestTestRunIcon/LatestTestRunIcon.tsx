import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import { styles, StylesType } from './LatestTestRunIconStyles';

interface TagItemProps extends StylesType {
  typeName: DataQualityTestRunStatusEnum;
}

const LatestRunIcon: React.FC<TagItemProps> = ({ classes, typeName }) => (
  <div className={cx(classes.latestRunIcon, typeName)} />
);

export default withStyles(styles)(LatestRunIcon);
