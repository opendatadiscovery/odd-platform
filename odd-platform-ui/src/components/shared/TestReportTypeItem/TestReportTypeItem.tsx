import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/TestReportTypeItem/TestReportTypeItemStyles';

export type DataSetTestReportTypeNames =
  | 'passed'
  | 'failed'
  | 'broken'
  | 'skipped'
  | 'unknown';

interface TestReportTypeItemProps extends StylesType {
  className?: string;
  count: number | undefined;
  typeName: DataSetTestReportTypeNames;
  size?: 'large' | 'small';
}

const TestReportTypeItem: React.FC<TestReportTypeItemProps> = ({
  classes,
  className,
  count,
  typeName,
  size = 'small',
}) => (
  <div className={cx(classes.container, className)} title={typeName}>
    {size === 'small' ? (
      <span className={cx(classes.filledContainer, classes[typeName])}>
        {count}
      </span>
    ) : (
      <>
        <span className={classes.count}>{count}</span>
        <span className={cx(classes.filledContainer, classes[typeName])}>
          {typeName}
        </span>
      </>
    )}
  </div>
);

export default withStyles(styles)(TestReportTypeItem);
