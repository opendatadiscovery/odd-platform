import React, { type FC } from 'react';
import { Grid } from '@mui/material';
import DatasetStructureHeader from './DatasetStructureHeader/DatasetStructureHeader';
import DatasetFieldOverview from './DatasetFieldOverview/DatasetFieldOverview';
import DatasetStructureList from './DatasetStructureList/DatasetStructureList';

const DatasetStructureView: FC = () => (
  <Grid container>
    <DatasetStructureHeader />
    <Grid container sx={{ borderTop: '1px solid', borderTopColor: 'divider' }}>
      <Grid item lg={6}>
        <DatasetStructureList />
      </Grid>
      <Grid item lg={6} sx={{ borderLeft: '1px solid', borderLeftColor: 'divider' }}>
        <DatasetFieldOverview />
      </Grid>
    </Grid>
  </Grid>
);

export default DatasetStructureView;
