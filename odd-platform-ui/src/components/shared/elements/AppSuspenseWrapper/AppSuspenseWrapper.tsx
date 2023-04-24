import React from 'react';
import AppLoadingPage from 'components/shared/elements/AppLoadingPage/AppLoadingPage';

interface SuspenseWrapperProps extends React.PropsWithChildren {
  lazyComponent?: React.FC;
}

const AppSuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  lazyComponent: LazyComponent,
  children,
}) => {
  if (LazyComponent) {
    return (
      <React.Suspense fallback={<AppLoadingPage />}>
        <LazyComponent />
      </React.Suspense>
    );
  }

  return <React.Suspense fallback={<AppLoadingPage />}>{children}</React.Suspense>;
};

export default AppSuspenseWrapper;
