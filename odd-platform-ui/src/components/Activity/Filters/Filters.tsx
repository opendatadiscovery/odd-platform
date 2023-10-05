import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';
import { fetchDataSourcesList, fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataSourcesList, getNamespaceList } from 'redux/selectors';
import { ActivityEventType } from 'generated-sources';
import { useQueryParams } from 'lib/hooks';
import {
  SingleFilter,
  MultipleFilter,
  CalendarFilter,
} from 'components/shared/elements/Activity';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { setQueryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  React.useEffect(() => {
    const params = { page: 1, size: 100 };
    dispatch(fetchDataSourcesList(params));
    dispatch(fetchNamespaceList(params));
  }, []);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);
  const excludedTypes = [
    'DATA_ENTITY_OVERVIEW_UPDATED',
    'DATA_ENTITY_METADATA_UPDATED',
    'DATA_ENTITY_SCHEMA_UPDATED',
    'DATA_ENTITY_RELATION_UPDATED',
    'CUSTOM_METADATA_CREATED',
    'CUSTOM_METADATA_UPDATED',
    'CUSTOM_METADATA_DELETED',
  ];
  const activityEventTypes = Object.values(ActivityEventType).filter(
    type => !excludedTypes.some(discardedType => discardedType === type)
  );

  const handleClearAll = React.useCallback(
    () => setQueryParams(defaultActivityQuery),
    [setQueryParams, defaultActivityQuery]
  );

  return (
    <S.Container>
      <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='h4'>{t('Filters')}</Typography>
        <Button text={t('Clear All')} buttonType='tertiary-m' onClick={handleClearAll} />
      </Grid>
      <S.ListContainer>
        <CalendarFilter />
        <SingleFilter
          key='ds'
          name={t('Datasource')}
          filterName='datasourceId'
          filterOptions={datasources}
          dataQA='datasource_filter'
        />
        <SingleFilter
          key='ns'
          filterName='namespaceId'
          name={t('Namespace')}
          filterOptions={namespaces}
          dataQA='namespace_filter'
        />
        <SingleFilter
          key='at'
          filterName='eventType'
          name={t('Event type')}
          filterOptions={activityEventTypes}
          dataQA='event_type_filter'
        />
        <MultipleFilter
          key='tg'
          filterName='tagIds'
          name={t('Tag')}
          dataQA='tag_filter'
        />
        <MultipleFilter
          key='ow'
          filterName='ownerIds'
          name={t('Owner')}
          dataQA='owner_filter'
        />
        <MultipleFilter
          key='us'
          filterName='userIds'
          name={t('User')}
          dataQA='user_filter'
        />
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
