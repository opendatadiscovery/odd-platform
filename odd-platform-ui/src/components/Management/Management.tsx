import React from 'react';
import { AppSuspenseWrapper } from 'components/shared';
import ManagementRoutes from './ManagementRoutes/ManagementRoutes';
import ManagementTabs from './ManagementTabs/ManagementTabs';
import * as S from './ManagementStyles';

const Management: React.FC = () => (
  <S.Container container wrap='nowrap'>
    <S.SidebarContainer item xs={3}>
      <ManagementTabs />
    </S.SidebarContainer>
    <S.ContentContainer item xs={9}>
      <AppSuspenseWrapper>
        <ManagementRoutes />
      </AppSuspenseWrapper>
    </S.ContentContainer>
  </S.Container>
);

export default Management;
