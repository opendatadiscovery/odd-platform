import React, { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared/elements';

const Overview = lazy(() => import('../Overview/Overview'));
const LinkedEntitiesList = lazy(
  () => import('../TermLinkedEntitiesList/LinkedEntitiesList')
);
const LinkedColumnsList = lazy(
  () => import('../TermLinkedColumnsList/LinkedColumnsList')
);

const TermDetailsRoutes: React.FC = () => (
  <AppSuspenseWrapper>
    <Routes>
      <Route path='overview' element={<Overview />} />
      <Route path='linked-entities' element={<LinkedEntitiesList />} />
      <Route path='linked-columns' element={<LinkedColumnsList />} />
      <Route path='' element={<Navigate to='overview' />} />
    </Routes>
  </AppSuspenseWrapper>
);

export default TermDetailsRoutes;
