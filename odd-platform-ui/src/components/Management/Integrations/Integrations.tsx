import React, { type FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared/elements';

const Integration = React.lazy(() => import('./Integration/Integration'));
const IntegrationPreviewList = React.lazy(
  () => import('./IntegrationPreviewList/IntegrationPreviewList')
);

const Integrations: FC = () => (
  <AppSuspenseWrapper>
    <Routes>
      <Route path='/' element={<IntegrationPreviewList />} />
      <Route path=':integrationId/*' element={<Integration />} />
    </Routes>
  </AppSuspenseWrapper>
);

export default Integrations;
