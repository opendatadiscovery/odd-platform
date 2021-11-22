import React from 'react';

interface SkeletonProps {
  renderContent: (contentProps: {
    randomSkeletonPercentWidth: () => string;
    key?: number;
  }) => JSX.Element;
  length?: number;
}

const SkeletonWrapper: React.FC<SkeletonProps> = ({
  length = 1,
  renderContent,
}) => {
  const randomSkeletonPercentWidth = () =>
    `${Math.round(75 + Math.random() * 15)}%`;

  return (
    <>
      {[...Array(length)].map((_, key) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={key} style={{ width: '100%' }}>
          {renderContent({ randomSkeletonPercentWidth, key })}
        </div>
      ))}
    </>
  );
};
export default SkeletonWrapper;
