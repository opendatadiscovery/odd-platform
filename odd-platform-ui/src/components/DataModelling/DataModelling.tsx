import React from 'react';
import { PageWithLeftSidebar } from 'components/shared/elements';
import { Grid } from '@mui/material';
import DataModellingRoutes from './DataModellingRoutes';

const DataModelling: React.FC = () => (
  <PageWithLeftSidebar.MainContainer>
    <Grid container px={2}>
      <DataModellingRoutes />
    </Grid>
  </PageWithLeftSidebar.MainContainer>
);

export default DataModelling;
