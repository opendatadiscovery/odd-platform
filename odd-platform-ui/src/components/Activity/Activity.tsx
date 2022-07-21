import React from 'react';
import * as S from 'components/shared/StyledComponents/PageWithLeftSidebar';
import Filters from './Filters/Filters';
import ActivityResults from './ActivityResults/ActivityResults';

const Activity: React.FC = () => (
  <S.MainContainer>
    <S.ContentContainer container spacing={2}>
      <S.LeftSidebarContainer item xs={3}>
        <Filters />
      </S.LeftSidebarContainer>
      <S.ListContainer item xs={9}>
        <ActivityResults />
      </S.ListContainer>
    </S.ContentContainer>
  </S.MainContainer>
);

export default Activity;
