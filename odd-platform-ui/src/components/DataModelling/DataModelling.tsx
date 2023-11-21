import React from 'react';
import { PageWithLeftSidebar } from 'components/shared/elements';
import { Grid } from '@mui/material';
import DataModellingRoutes from './DataModellingRoutes';

const DataModelling: React.FC = () => (
  <PageWithLeftSidebar.MainContainer>
    <PageWithLeftSidebar.ContentContainer container spacing={2}>
      <Grid container p={2}>
        <DataModellingRoutes />
      </Grid>
    </PageWithLeftSidebar.ContentContainer>
  </PageWithLeftSidebar.MainContainer>
);

export default DataModelling;
