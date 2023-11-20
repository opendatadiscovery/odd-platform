import React from 'react';
import { PageWithLeftSidebar } from 'components/shared/elements';
import { Grid } from '@mui/material';
import DataModellingTabs from './DataModellingTabs';
import DataModellingRoutes from './DataModellingRoutes';

const DataModelling: React.FC = () => (
  <PageWithLeftSidebar.MainContainer>
    <Grid item container px={2} xs={12} rowSpacing={2}>
      <DataModellingRoutes />
    </Grid>
  </PageWithLeftSidebar.MainContainer>
);

export default DataModelling;
