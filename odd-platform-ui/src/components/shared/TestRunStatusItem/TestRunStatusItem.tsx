import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/TestRunStatusItem/TestRunStatusItemStyles';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

interface TestRunStatusItemProps extends StylesType {
  className?: string;
  count?: number;
  typeName: DataQualityTestRunStatusEnum | undefined;
  size?: 'large' | 'small';
}

const TestRunStatusItem: React.FC<TestRunStatusItemProps> = ({
  className,
  size = 'large',
  typeName,
  count,
  classes,
}) => (
  <div className={cx(classes.container, className)} title={typeName}>
    {size === 'small' ? (
      <span className={cx(classes.filledContainer, typeName)}>
        {count}
      </span>
    ) : (
      <>
        <span className={classes.count}>{count}</span>
        <span className={cx(classes.filledContainer, typeName)}>
          {typeName && typeName.toLowerCase()}
        </span>
      </>
    )}
  </div>
);

export default withStyles(styles)(TestRunStatusItem);
