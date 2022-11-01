import React from 'react';
import { Box, Grid } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './MessagesListStyles';

const MessagesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId, versionId } = useAppParams();
  const { datasetStructurePath } = useAppPaths();

  return (
    <S.Container>
      <S.MessagesContainer container>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => (
          <Grid container minHeight={100} height='100%'>
            {item}
          </Grid>
        ))}
      </S.MessagesContainer>
    </S.Container>
  );
};
export default MessagesList;
