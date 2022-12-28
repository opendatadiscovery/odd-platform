import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppButton } from 'components/shared';
import { ActivityEventType } from 'generated-sources';
import { MultipleFilter, CalendarFilter, SingleFilter } from 'components/shared/Activity';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
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
        <Typography variant='h4'>Filters</Typography>
        <AppButton color='tertiary' size='medium' onClick={handleClearAll}>
          Clear All
        </AppButton>
      </Grid>
      <>
        <CalendarFilter />
        <SingleFilter
          key='at'
          filterName='eventType'
          name='Event type'
          filterOptions={activityEventTypes}
        />
        <MultipleFilter key='us' filterName='userIds' name='User' />
      </>
    </S.Container>
  );
};

export default Filters;
