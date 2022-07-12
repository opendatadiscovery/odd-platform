import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import { fetchDataSourcesList, fetchNamespaceList } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { getDataSourcesList, getNamespaceList } from 'redux/selectors';
import { clearActivityFilters } from 'redux/reducers/activity.slice';
import { ActivityEventType } from 'generated-sources';
import MultipleFilter from 'components/shared/Activity/ActivityFilterItems/MultipleFilter/MultipleFilter';
import CalendarFilter from 'components/shared/Activity/ActivityFilterItems/CalendarFilter/CalendarFilter';
import SingleFilter from 'components/shared/Activity/ActivityFilterItems/SingleFilter/SingleFilter';
import * as S from './FiltersStyles';

const Filters: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataSourcesList({ page: 1, size: 100 }));
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
  }, []);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);

  return (
    <S.Container>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={() => dispatch(clearActivityFilters())}
        >
          Clear All
        </AppButton>
      </Grid>
      <S.ListContainer>
        <CalendarFilter />
        <SingleFilter
          key="at"
          filterName="eventType"
          name="Event type"
          filterOptions={Object.values(ActivityEventType)}
        />
        {/* <SingleFilter */}
        {/*  key="ds" */}
        {/*  name="Datasource" */}
        {/*  filterName="datasourceId" */}
        {/*  filterOptions={datasources} */}
        {/* /> */}
        {/* <SingleFilter */}
        {/*  key="ns" */}
        {/*  filterName="namespaceId" */}
        {/*  name="Namespace" */}
        {/*  filterOptions={namespaces} */}
        {/* /> */}

        {/* <MultipleFilter key="tg" filterName="tagIds" name="Tag" /> */}
        <MultipleFilter key="us" filterName="userIds" name="User" />
        {/* <MultipleFilter key="ow" filterName="ownerIds" name="Owner" /> */}
        {/* TODO update loader conditions */}
        {/* <S.FacetsLoaderContainer container sx={{ mt: 2 }}> */}
        {/*  {(isSearchFacetsUpdating || isDatasourceListFetching) && ( */}
        {/*    <AppCircularProgress size={16} text="Updating filters" /> */}
        {/*  )} */}
        {/* </S.FacetsLoaderContainer> */}
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
