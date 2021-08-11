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
      {[...Array(length)].map((_, key) =>
        renderContent({ randomSkeletonPercentWidth, key })
      )}
    </>
  );
};
export default withStyles(styles)(SkeletonWrapper);
