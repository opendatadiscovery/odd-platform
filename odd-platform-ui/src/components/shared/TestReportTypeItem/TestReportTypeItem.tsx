import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/TestReportTypeItem/TestReportTypeItemStyles';
import { DataQualityTestRunStatusEnum } from 'generated-sources';

interface TestReportTypeItemProps extends StylesType {
  className?: string;
  count: number | undefined;
  typeName: DataQualityTestRunStatusEnum;
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
      <span className={cx(classes.filledContainer, typeName)}>
        {count}
      </span>
    ) : (
      <>
        <span className={classes.count}>{count}</span>
        <span className={cx(classes.filledContainer, typeName)}>
          {typeName.toLocaleLowerCase()}
        </span>
      </>
    )}
  </div>
);

export default withStyles(styles)(TestReportTypeItem);
