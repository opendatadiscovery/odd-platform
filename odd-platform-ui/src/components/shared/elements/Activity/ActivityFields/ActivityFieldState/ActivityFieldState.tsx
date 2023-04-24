import React, { type CSSProperties } from 'react';
import { Collapse, Grid } from '@mui/material';
import * as S from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldStateStyles';

interface ActivityFieldProps {
  isDetailsOpen: boolean;
  oldStateChildren?: React.ReactNode;
  newStateChildren?: React.ReactNode;
  stateDirection?: CSSProperties['flexDirection'];
}

const ActivityFieldState: React.FC<ActivityFieldProps> = ({
  isDetailsOpen,
  oldStateChildren,
  newStateChildren,
  stateDirection = 'column',
}) => (
  <Grid container flexDirection='column'>
    <Collapse in={isDetailsOpen} timeout='auto' unmountOnExit sx={{ mt: 0.5 }}>
      {isDetailsOpen ? (
        <S.Container container>
          {oldStateChildren && (
            <S.StateContainer $stateDirection={stateDirection} container>
              {oldStateChildren}
            </S.StateContainer>
          )}
          {oldStateChildren && newStateChildren && <S.SeparatorIcon />}
          {newStateChildren && (
            <S.StateContainer $stateDirection={stateDirection} container>
              {newStateChildren}
            </S.StateContainer>
          )}
        </S.Container>
      ) : null}
    </Collapse>
  </Grid>
);
export default ActivityFieldState;
