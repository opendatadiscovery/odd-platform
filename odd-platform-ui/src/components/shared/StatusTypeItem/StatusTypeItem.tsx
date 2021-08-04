import React from 'react';
import { withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from 'components/shared/StatusTypeItem/StatusTypeItemStyles';
import {
  AlertStatus,
  DataQualityTestRunStatusEnum,
} from 'generated-sources';
import { toTitleCase } from 'lib/helpers';

interface TestRunTypeItemProps extends StylesType {
  className?: string;
  count?: number;
  typeName: DataQualityTestRunStatusEnum;
  size: 'large' | 'small';
}
interface AlertTypeItemProps extends StylesType {
  className?: string;
  typeName: AlertStatus;
}

type StatusTypeItemProps = TestRunTypeItemProps | AlertTypeItemProps;

const isTestRunTypeItemProps = (
  props: StatusTypeItemProps
): props is TestRunTypeItemProps => 'size' in props;

const TestRunTypeItem: React.FC<TestRunTypeItemProps> = ({
  className,
  size,
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
          {typeName.toLowerCase()}
        </span>
      </>
    )}
  </div>
);

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

const StatusTypeItem: React.FC<StatusTypeItemProps> = props =>
  isTestRunTypeItemProps(props)
    ? TestRunTypeItem(props)
    : AlertTypeItem(props);

export default withStyles(styles)(StatusTypeItem);
