import React from 'react';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import ManagementRoutes from './ManagementRoutes/ManagementRoutes';
import ManagementTabs from './ManagementTabs/ManagementTabs';
import * as S from './ManagementStyles';

const Management: React.FC = () => (
  <WithPermissionsProvider
    allowedPermissions={[Permission.OWNER_ASSOCIATION_MANAGE]}
    resourcePermissions={[]}
  >
    <S.Container container wrap='nowrap'>
      <S.SidebarContainer item xs={3}>
        <ManagementTabs />
      </S.SidebarContainer>
      <S.ContentContainer item xs={9}>
        <ManagementRoutes />
      </S.ContentContainer>
    </S.Container>
  </WithPermissionsProvider>
);

export default Management;
