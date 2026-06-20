import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';
import { fetchDataSourcesList, fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataSourcesList, getNamespaceList } from 'redux/selectors';
import { AlertStatus } from 'generated-sources';
import { useQueryParams } from 'lib/hooks';
import {
  SingleFilter,
  MultipleFilter,
  CalendarFilter,
} from 'components/shared/elements/Activity';
import { type AlertsQuery, defaultAlertsQuery } from 'components/Alerts/common';
import * as S from './FiltersStyles';

// Mirrors the Activity Filters panel, reusing the shared ActivityFilterItems widgets. The alerts
// surface drops the activity-specific Event-type / Made-by filters and adds a Status single-select.
const Filters: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { setQueryParams } = useQueryParams<AlertsQuery>(defaultAlertsQuery);

  React.useEffect(() => {
    const params = { page: 1, size: 100 };
    dispatch(fetchDataSourcesList(params));
    dispatch(fetchNamespaceList(params));
  }, []);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);

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
    () => setQueryParams(defaultAlertsQuery),
    [setQueryParams]
  );

  return (
    <S.Container>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
        <Button text={t('Clear All')} buttonType='tertiary-m' onClick={handleClearAll} />
      </Grid>
      <S.ListContainer>
        <CalendarFilter defaultQuery={defaultAlertsQuery} />
        <SingleFilter
          key='ds'
          name={t('Datasource')}
          filterName='datasourceId'
          defaultQuery={defaultAlertsQuery}
          filterOptions={datasources}
          dataQA='datasource_filter'
        />
        <SingleFilter
          key='ns'
          filterName='namespaceId'
          name={t('Namespace')}
          defaultQuery={defaultAlertsQuery}
          filterOptions={namespaces}
          dataQA='namespace_filter'
        />
        <SingleFilter
          key='st'
          filterName='status'
          name={t('Status')}
          defaultQuery={defaultAlertsQuery}
          filterOptions={alertStatuses}
          getOptionLabel={statusLabel}
          dataQA='status_filter'
        />
        <MultipleFilter
          key='tg'
          filterName='tagIds'
          name={t('Tag')}
          defaultQuery={defaultAlertsQuery}
          dataQA='tag_filter'
        />
        <MultipleFilter
          key='ow'
          filterName='ownerIds'
          name={t('Owner')}
          defaultQuery={defaultAlertsQuery}
          dataQA='owner_filter'
        />
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
