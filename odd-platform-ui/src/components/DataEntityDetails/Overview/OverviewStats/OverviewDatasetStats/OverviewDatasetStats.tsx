import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum } from 'generated-sources';
import EntityClassItem from 'components/shared/elements/EntityClassItem/EntityClassItem';
import NumberFormatted from 'components/shared/elements/NumberFormatted/NumberFormatted';
import RowsIcon from 'components/shared/icons/RowsIcon';
import ColumnsIcon from 'components/shared/icons/ColumnsIcon';
import UserIcon from 'components/shared/icons/UserIcon';
import { StatLabel } from './OverviewDatasetStatsStyles';

interface OverviewDatasetStatsProps {
  stats: {
    rowsCount: number;
    fieldsCount: number;
    consumersCount: number;
  };
}

const OverviewDatasetStats: React.FC<OverviewDatasetStatsProps> = ({ stats }) => (
  <Grid container>
    <Grid item xs={12} sx={{ ml: 0, mb: 1.25 }}>
      <EntityClassItem entityClassName={DataEntityClassNameEnum.SET} fullName />
    </Grid>
    <Grid alignItems='center' item container xs={4}>
      <Grid item xs={12}>
        <StatLabel variant='h6'>Rows</StatLabel>
      </Grid>
      <Grid item container xs={12} wrap='nowrap' alignItems='center'>
        <RowsIcon sx={{ mr: 1 }} />
        <Typography variant='h2'>
          <NumberFormatted value={stats?.rowsCount} />
        </Typography>
      </Grid>
    </Grid>
    <Grid alignItems='center' item container xs={4}>
      <Grid item xs={12}>
        <StatLabel variant='h6'>Columns</StatLabel>
      </Grid>
      <Grid item container xs={12} wrap='nowrap' alignItems='center'>
        <ColumnsIcon sx={{ mr: 1 }} />
        <Typography variant='h2'>
          <NumberFormatted value={stats?.fieldsCount} />
        </Typography>
      </Grid>
    </Grid>
    <Grid alignItems='center' item container xs={4}>
      <Grid item xs={12}>
        <StatLabel variant='h6'>Used by</StatLabel>
      </Grid>
      <Grid item container xs={12} wrap='nowrap' alignItems='center'>
        <UserIcon sx={{ mr: 1 }} />
        <Typography variant='h2'>
          <NumberFormatted value={stats?.consumersCount} />
        </Typography>
      </Grid>
    </Grid>
  </Grid>
);

export default OverviewDatasetStats;
