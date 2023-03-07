import React from 'react';
import AppLoadingPage from '../AppLoadingPage/AppLoadingPage';

interface SuspenseWrapperProps {
  LazyComponent: React.FC;
}

const AppSuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ LazyComponent }) => (
  <React.Suspense fallback={<AppLoadingPage />}>
    <LazyComponent />
  </React.Suspense>
);

export default AppSuspenseWrapper;
