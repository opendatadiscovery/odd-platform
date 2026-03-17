import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum } from 'generated-sources';
import { EntityClassItem, NumberFormatted } from 'components/shared/elements';
import { UserIcon, ColumnsIcon, RowsIcon } from 'components/shared/icons';

interface OverviewDatasetStatsProps {
  stats: {
    rowsCount: number;
    fieldsCount: number;
    consumersCount: number;
  };
}

const OverviewDatasetStats: React.FC<OverviewDatasetStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <Grid container>
      <Grid sx={{ ml: 0, mb: 1.25 }} size={12}>
        <EntityClassItem entityClassName={DataEntityClassNameEnum.SET} fullName />
      </Grid>
      <Grid alignItems='center' container size={4}>
        <Grid size={12}>
          <Typography variant='h4'>{t('Rows')}</Typography>
        </Grid>
        <Grid container wrap='nowrap' alignItems='center' size={12}>
          <RowsIcon sx={{ mr: 1 }} />
          <Typography variant='h2'>
            <NumberFormatted value={stats?.rowsCount} />
          </Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container size={4}>
        <Grid size={12}>
          <Typography variant='h4'>{t('Columns')}</Typography>
        </Grid>
        <Grid container wrap='nowrap' alignItems='center' size={12}>
          <ColumnsIcon sx={{ mr: 1 }} />
          <Typography variant='h2'>
            <NumberFormatted value={stats?.fieldsCount} />
          </Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container size={4}>
        <Grid size={12}>
          <Typography variant='h4'>{t('Used by')}</Typography>
        </Grid>
        <Grid container wrap='nowrap' alignItems='center' size={12}>
          <UserIcon sx={{ mr: 1 }} />
          <Typography variant='h2'>
            <NumberFormatted value={stats?.consumersCount} />
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewDatasetStats;
