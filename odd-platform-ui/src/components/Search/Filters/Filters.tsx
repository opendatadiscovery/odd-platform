import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataSource,
  DataSourceApiGetDataSourceListRequest,
  DataSourceList,
  Namespace,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import { SearchType } from 'redux/interfaces/search';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import { StylesType } from './FiltersStyles';

interface FiltersProps extends StylesType {
  searchType?: SearchType;
  datasources: DataSource[];
  namespaces: Namespace[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => Promise<DataSourceList>;
  fetchNamespaceList: (
    params: NamespaceApiGetNamespaceListRequest
  ) => void;
  clearDataEntitySearchFilters: () => void;
  isSearchFacetsUpdating: boolean;
  isDatasourceListFetching: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  classes,
  searchType,
  datasources,
  namespaces,
  fetchDataSourcesList,
  fetchNamespaceList,
  clearDataEntitySearchFilters,
  isSearchFacetsUpdating,
  isDatasourceListFetching,
}) => {
  React.useEffect(() => {
    fetchDataSourcesList({ page: 1, size: 100 });
    fetchNamespaceList({ page: 1, size: 100 });
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.caption}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={clearDataEntitySearchFilters}
        >
          Clear All
        </AppButton>
      </div>
      <div className={classes.listContainer}>
        <SingleFilterItemContainer
          key="ds"
          facetName="datasources"
          name="Datasource"
          facetOptions={datasources}
        />
        {searchType && searchType > 0 ? (
          <MultipleFilterItemContainer
            key="st"
            facetName="subtypes"
            name="Type"
          />
        ) : null}
        <SingleFilterItemContainer
          key="ns"
          facetName="namespaces"
          name="Namespace"
          facetOptions={namespaces}
        />
        <MultipleFilterItemContainer
          key="ow"
          facetName="owners"
          name="Owner"
        />
        <MultipleFilterItemContainer
          key="tg"
          facetName="tags"
          name="Tag"
        />
        <Grid
          container
          justifyContent="center"
          className={classes.facetsLoaderContainer}
        >
          {(isSearchFacetsUpdating || isDatasourceListFetching) && (
            <AppCircularProgress size={16} text="Updating filters" />
          )}
        </Grid>
      </div>
    </div>
  );
};

export default Filters;
