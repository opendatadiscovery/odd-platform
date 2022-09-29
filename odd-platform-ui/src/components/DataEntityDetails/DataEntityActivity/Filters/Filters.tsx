import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { clearActivityFilters } from 'redux/slices/activity.slice';
import { ActivityEventType } from 'generated-sources';
import MultipleFilter from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/MultipleFilter';
import CalendarFilter from 'components/shared/Activity/ActivityFilterItems/CalendarFilter/CalendarFilter';
import SingleFilter from 'components/shared/Activity/ActivityFilterItems/SingleFilter/SingleFilter';
import { fetchDataEntityActivityList } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import { getActivitiesQueryParams } from 'redux/selectors';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const { dataEntityId } = useAppParams();
  const dispatch = useAppDispatch();

  const queryParams = useAppSelector(getActivitiesQueryParams);

  const asyncClearFilters = async () => dispatch(clearActivityFilters());

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

  return (
    <S.Container>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={() =>
            asyncClearFilters().then(() =>
              dispatch(
                fetchDataEntityActivityList({
                  ...queryParams,
                  dataEntityId,
                })
              )
            )
          }
        >
          Clear All
        </AppButton>
      </Grid>
      <>
        <CalendarFilter />
        <SingleFilter
          key="at"
          filterName="eventType"
          name="Event type"
          filterOptions={activityEventTypes}
        />
        <MultipleFilter key="us" filterName="userIds" name="User" />
      </>
    </S.Container>
  );
};

export default Filters;
