import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

interface SkeletonProps {
  loading: boolean;
  searchResultsContainerRef: React.RefObject<Element>;
}

const SearchResultsSkeletonWrapper: React.FC<SkeletonProps> = ({
  loading,
  // classes,
  searchResultsContainerRef,
  children,
}) => {
  const [
    { skeletonWidth, skeletonHeight },
    setSkeletonSize,
  ] = React.useState<{ skeletonWidth: string; skeletonHeight: string }>({
    skeletonWidth: '0px',
    skeletonHeight: '0px',
  });
  React.useEffect(() => {
    if (searchResultsContainerRef && searchResultsContainerRef.current) {
      const { width, height } = getComputedStyle(
        searchResultsContainerRef.current as Element
      );
      setSkeletonSize({ skeletonWidth: width, skeletonHeight: height });
    }
  }, [searchResultsContainerRef, searchResultsContainerRef.current]);

  return (
    <>
      <Skeleton
        variant="rect"
        height={skeletonHeight}
        width={skeletonWidth}
        animation="wave"
        style={{ display: loading ? 'block' : 'none' }}
      />
      <div style={{ display: loading ? 'none' : 'block' }}>
        {React.Children.map(children, child => child)}
      </div>
    </>
  );
};
export default SearchResultsSkeletonWrapper;
