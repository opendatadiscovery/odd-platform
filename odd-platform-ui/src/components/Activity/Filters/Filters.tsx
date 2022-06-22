import React from 'react';
import { Grid, Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import {
  fetchActivityEventTypes,
  fetchDataSourcesList,
  fetchNamespaceList,
} from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { ActivityApiGetActivityRequest as ActivityFilters } from 'generated-sources';
import {
  getActivityEventTypes,
  getDataSourcesList,
  getNamespaceList,
} from 'redux/selectors';
import * as S from './FiltersStyles';
import SingleFilter from './FilterItem/SingleFilter/SingleFilter';

// interface FiltersProps {
//   searchClass?: SearchClass;
//   datasources: DataSource[];
//   namespaces: Namespace[];
//   fetchDataSourcesList: (
//     params: DataSourceApiGetDataSourceListRequest
//   ) => Promise<DataSourceList>;
//   fetchNamespaceList: (
//     params: NamespaceApiGetNamespaceListRequest
//   ) => void;
//   clearDataEntitySearchFilters: () => void;
//   isSearchFacetsUpdating: boolean;
//   isDatasourceListFetching: boolean;
// }

export type FilterNames = keyof ActivityFilters;

const Filters: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchDataSourcesList({ page: 1, size: 100 }));
    dispatch(fetchNamespaceList({ page: 1, size: 100 }));
    dispatch(fetchActivityEventTypes());
  }, []);

  const datasources = useAppSelector(getDataSourcesList);
  const namespaces = useAppSelector(getNamespaceList);
  const eventTypes = useAppSelector(getActivityEventTypes);

  return (
    <S.Container>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          // TODO clear filters
          // onClick={() => clearDataEntitySearchFilters()}
        >
          Clear All
        </AppButton>
      </Grid>
      <S.ListContainer>
        <div>Period filter</div>
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
        {/* TODO check for work */}
        <SingleFilter
          key="at"
          filterName="eventType"
          name="Event type"
          filterOptions={eventTypes}
        />
        {/* <MultipleFilterItemContainer */}
        {/*  key="ow" */}
        {/*  facetName="owners" */}
        {/*  name="Owner" */}
        {/* /> */}
        {/* <MultipleFilterItemContainer */}
        {/*  key="tg" */}
        {/*  facetName="tags" */}
        {/*  name="Tag" */}
        {/* /> */}
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
