import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import { fetchDataSourcesList, fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataSourcesList, getNamespaceList } from 'redux/selectors';
import { clearActivityFilters } from 'redux/slices/activity.slice';
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
          onClick={() => {
            dispatch(clearActivityFilters());
          }}
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
          filterOptions={activityEventTypes}
        />
        <MultipleFilter key="tg" filterName="tagIds" name="Tag" />
        <MultipleFilter key="ow" filterName="ownerIds" name="Owner" />
        <MultipleFilter key="us" filterName="userIds" name="User" />
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
