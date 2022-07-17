import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import {
  fetchActivityCounts,
  fetchActivityList,
  fetchDataSourcesList,
  fetchNamespaceList,
} from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getActivitiesCountsParams,
  getActivitiesQueryParams,
  getDataSourcesList,
  getNamespaceList,
} from 'redux/selectors';
import { clearActivityFilters } from 'redux/reducers/activity.slice';
import { ActivityEventType } from 'generated-sources';
import SingleFilter from 'components/shared/Activity/ActivityFilterItems/SingleFilter/SingleFilter';
import CalendarFilter from 'components/shared/Activity/ActivityFilterItems/CalendarFilter/CalendarFilter';
import MultipleFilter from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/MultipleFilter';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataSourcesList({ page: 1, size: 100 }));
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
  }, []);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const countParams = useAppSelector(getActivitiesCountsParams);

  const asyncClearFilters = async () => dispatch(clearActivityFilters());

  return (
    <S.Container>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={() =>
            asyncClearFilters().then(() => {
              dispatch(fetchActivityList(queryParams));
              dispatch(fetchActivityCounts(countParams));
            })
          }
        >
          Clear All
        </AppButton>
      </Grid>
      <S.ListContainer>
        <CalendarFilter />
        <SingleFilter
          key="ds"
          name="Datasource"
          filterName="datasourceId"
          filterOptions={datasources}
        />
        <SingleFilter
          key="ns"
          filterName="namespaceId"
          name="Namespace"
          filterOptions={namespaces}
        />
        <SingleFilter
          key="at"
          filterName="eventType"
          name="Event type"
          filterOptions={Object.values(ActivityEventType)}
        />
        <MultipleFilter key="tg" filterName="tagIds" name="Tag" />
        <MultipleFilter key="ow" filterName="ownerIds" name="User" />
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
