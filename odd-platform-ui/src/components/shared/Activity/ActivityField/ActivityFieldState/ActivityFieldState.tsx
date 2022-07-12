import React from 'react';
import { Collapse, Grid } from '@mui/material';
import * as S from './ActivityFieldStateStyles';

interface ActivityFieldProps {
  isDetailsOpen: boolean;
  oldStateData?: Array<any>;
  newStateData?: Array<any>;
  stateComponent: (
    ownerName: string,
    roleName: string,
    isChanged?: boolean
  ) => JSX.Element;
}

const ActivityFieldState: React.FC<ActivityFieldProps> = ({
  isDetailsOpen,
  oldStateData,
  newStateData,
  stateComponent,
}) => (
  // const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  // const handleOpenDetails;

  <Grid container flexDirection="column">
    <Collapse
      in={isDetailsOpen}
      timeout="auto"
      unmountOnExit
      sx={{ mt: 0.5 }}
    >
      {isDetailsOpen ? (
        <S.Container container>
          <S.StateContainer container>
            {oldStateData?.map(data =>
              stateComponent(data.ownerName, data.roleName, data.isChanged)
            )}
          </S.StateContainer>
          <S.SeparatorIcon />
          <S.StateContainer container>
            {/* {oldStateData?.map(data => */}
            {/*  stateComponent(data.ownerName, data.roleName) */}
            {/* )} */}
            {newStateData?.map(data =>
              stateComponent(data.ownerName, data.roleName, data.isChanged)
            )}
          </S.StateContainer>
        </S.Container>
      ) : null}
    </Collapse>
  </Grid>
);
export default ActivityFieldState;
