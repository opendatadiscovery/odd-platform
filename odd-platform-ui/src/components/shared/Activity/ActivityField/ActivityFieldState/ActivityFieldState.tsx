import React from 'react';
import { Collapse, Grid } from '@mui/material';
import * as S from './ActivityFieldStateStyles';

interface ActivityFieldProps {
  isDetailsOpen: boolean;
  oldStateChildren?: React.ReactNode;
  newStateChildren?: React.ReactNode;
  stateDirection?: 'row' | 'column';
}

const ActivityFieldState: React.FC<ActivityFieldProps> = ({
  isDetailsOpen,
  oldStateChildren,
  newStateChildren,
  stateDirection = 'column',
}) => (
  <Grid container flexDirection="column">
    <Collapse
      in={isDetailsOpen}
      timeout="auto"
      unmountOnExit
      sx={{ mt: 0.5 }}
    >
      {isDetailsOpen ? (
        <S.Container container>
          {oldStateChildren && (
            <S.StateContainer
              $stateDirection={stateDirection}
              container
              flexWrap="nowrap"
            >
              {oldStateChildren}
            </S.StateContainer>
          )}
          {oldStateChildren && newStateChildren && <S.SeparatorIcon />}
          {newStateChildren && (
            <S.StateContainer
              $stateDirection={stateDirection}
              container
              flexWrap="nowrap"
            >
              {newStateChildren}
            </S.StateContainer>
          )}
        </S.Container>
      ) : null}
    </Collapse>
  </Grid>
);
export default ActivityFieldState;
