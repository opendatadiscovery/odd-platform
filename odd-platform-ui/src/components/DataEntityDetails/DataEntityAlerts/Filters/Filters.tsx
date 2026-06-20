import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';
import { AlertStatus } from 'generated-sources';
import { CalendarFilter, SingleFilter } from 'components/shared/elements/Activity';
import { useQueryParams } from 'lib/hooks';
import {
  type DataEntityAlertsQuery,
  defaultDataEntityAlertsQuery,
} from 'components/DataEntityDetails/DataEntityAlerts/common';
import * as S from './FiltersStyles';

// Per-entity alerts filters — Period + Status, reusing the shared ActivityFilterItems widgets
// (mirrors the per-entity Activity Filters). No datasource / namespace / tag / owner here: those are
// global-view dimensions, not meaningful within a single entity's alert stream.
const Filters: React.FC = () => {
  const { t } = useTranslation();
  const { setQueryParams } = useQueryParams<DataEntityAlertsQuery>(
    defaultDataEntityAlertsQuery
  );

  const alertStatuses = React.useMemo(() => Object.values(AlertStatus), []);
  const statusLabel = React.useCallback(
    (status: string) => {
      switch (status) {
        case AlertStatus.OPEN:
          return t('Open');
        case AlertStatus.RESOLVED:
          return t('Resolved');
        case AlertStatus.RESOLVED_AUTOMATICALLY:
          return t('Resolved automatically');
        default:
          return status;
      }
    },
    [t]
  );

  const handleClearAll = React.useCallback(
    () => setQueryParams(defaultDataEntityAlertsQuery),
    [setQueryParams]
  );

  return (
    <S.Container>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
        <Button text={t('Clear All')} buttonType='tertiary-m' onClick={handleClearAll} />
      </Grid>
      <>
        <CalendarFilter defaultQuery={defaultDataEntityAlertsQuery} />
        <SingleFilter
          key='st'
          filterName='status'
          name={t('Status')}
          defaultQuery={defaultDataEntityAlertsQuery}
          filterOptions={alertStatuses}
          getOptionLabel={statusLabel}
          dataQA='status_filter'
        />
      </>
    </S.Container>
  );
};

export default Filters;
