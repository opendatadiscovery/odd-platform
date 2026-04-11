import React from 'react';
import * as S from 'components/shared/elements/StyledComponents/PageWithLeftSidebar';
import ActivityResults from './ActivityResults/ActivityResults';
import Filters from './Filters/Filters';

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
