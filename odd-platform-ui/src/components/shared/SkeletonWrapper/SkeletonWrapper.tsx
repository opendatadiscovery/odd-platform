import React from 'react';
import { withStyles } from '@material-ui/core';
import { styles, StylesType } from './SkeletonWrapperStyles';

interface SkeletonProps extends StylesType {
  renderContent: (contentProps: {
    randomSkeletonPercentWidth: () => string;
    key?: number;
  }) => JSX.Element;
  length?: number;
}

const SkeletonWrapper: React.FC<SkeletonProps> = ({
  classes,
  length = 1,
  renderContent,
}) => {
  const randomSkeletonPercentWidth = () =>
    `${Math.round(75 + Math.random() * 15)}%`;

  return (
    <>
      {[...Array(length)].map((_, key) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={key} className={classes.container}>
          {renderContent({ randomSkeletonPercentWidth, key })}
        </div>
      ))}
    </>
  );
};
export default withStyles(styles)(SkeletonWrapper);
