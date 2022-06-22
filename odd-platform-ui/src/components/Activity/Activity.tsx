import React from 'react';
import { useHistory } from 'react-router-dom';
import * as S from 'components/shared/StyledComponents/PageWithLeftSidebar';

// import FiltersContainer from './Filters/FiltersContainer';

interface ActivityProps {
  searchIdParam?: string;
}

const Activity: React.FC<ActivityProps> = ({ searchIdParam }) => {
  const history = useHistory();

  return (
    <S.MainContainer>
      <S.ContentContainer container spacing={2}>
        <S.LeftSidebarContainer item xs={3}>
          {/* <FiltersContainer /> */}
        </S.LeftSidebarContainer>
        <S.ListContainer item xs={9}>
          lul
          {/* <ResultsContainer /> */}
        </S.ListContainer>
      </S.ContentContainer>
    </S.MainContainer>
  );
};

export default Activity;
