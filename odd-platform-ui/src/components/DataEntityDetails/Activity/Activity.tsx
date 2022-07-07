import React from 'react';
import { useHistory } from 'react-router-dom';
// import * as S from 'components/shared/StyledComponents/PageWithLeftSidebar';
import { Grid } from '@mui/material';
import ActivityResults from './ActivityResults/ActivityResults';
import Filters from './Filters/Filters';

const Activity: React.FC = () => {
  const history = useHistory();

  return (
    <Grid container flexWrap="nowrap">
      <Filters />
      <ActivityResults />
    </Grid>
    // <S.MainContainer>
    //   <S.ContentContainer container spacing={2}>
    //     <S.LeftSidebarContainer item xs={3}>
    //       <Filters />
    //     </S.LeftSidebarContainer>
    //     <S.ListContainer item xs={9}>
    //       <ActivityResults />
    //     </S.ListContainer>
    //   </S.ContentContainer>
    // </S.MainContainer>
  );
};

export default Activity;
