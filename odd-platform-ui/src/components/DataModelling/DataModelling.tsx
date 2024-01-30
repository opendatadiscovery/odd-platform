import React from 'react';
import * as S from 'components/shared/styled-components/layout';
import DataModellingRoutes from './DataModellingRoutes';
import DataModellingTabs from './DataModellingTabs';

const DataModelling: React.FC = () => (
  <S.LayoutContainer>
    <S.Sidebar $alignSelf='flex-start' $position='sticky'>
      <DataModellingTabs />
    </S.Sidebar>
    <S.Content>
      <DataModellingRoutes />
    </S.Content>
  </S.LayoutContainer>
);

export default DataModelling;
