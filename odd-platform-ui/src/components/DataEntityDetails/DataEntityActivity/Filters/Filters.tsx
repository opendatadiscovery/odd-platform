import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/shared/elements';
import { ActivityEventType } from 'generated-sources';
import {
  CalendarFilter,
  MultipleFilter,
  SingleFilter,
} from 'components/shared/elements/Activity';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const { setQueryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const excludedTypes = [
    'DATA_ENTITY_OVERVIEW_UPDATED',
    'DATA_ENTITY_METADATA_UPDATED',
    'DATA_ENTITY_SCHEMA_UPDATED',
    'DATA_ENTITY_RELATION_UPDATED',
    'CUSTOM_METADATA_CREATED',
    'CUSTOM_METADATA_UPDATED',
    'CUSTOM_METADATA_DELETED',
  ];
  const activityEventTypes = React.useMemo(
    () =>
      Object.values(ActivityEventType).filter(
        type => !excludedTypes.some(excludedType => excludedType === type)
      ),
    excludedTypes
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
      <>
        <CalendarFilter />
        <SingleFilter
          key='at'
          filterName='eventType'
          name={t('Event type')}
          filterOptions={activityEventTypes}
        />
        <MultipleFilter key='us' filterName='userIds' name={t('User')} />
      </>
    </S.Container>
  );
};

export default Filters;
