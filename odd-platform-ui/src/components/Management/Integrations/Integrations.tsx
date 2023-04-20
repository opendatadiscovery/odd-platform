import React, { type FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { AppSuspenseWrapper } from 'components/shared/elements';

const Integration = React.lazy(() => import('./Integration/Integration'));
const IntegrationPreviewList = React.lazy(
  () => import('./IntegrationPreviewList/IntegrationPreviewList')
);

const Integrations: FC = () => {
  const { ManagementRoutes } = useAppPaths();

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route path='/' element={<IntegrationPreviewList />} />
        <Route path={ManagementRoutes.integrationIdParam} element={<Integration />}>
          <Route path={ManagementRoutes.integrationViewTypeParam} />
        </Route>
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default Integrations;
