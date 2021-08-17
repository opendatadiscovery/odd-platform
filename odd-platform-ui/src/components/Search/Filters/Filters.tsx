import React from 'react';
import { Typography } from '@material-ui/core';
import {
  DataSource,
  DataSourceApiGetDataSourceListRequest,
  DataSourceList,
} from 'generated-sources';
import { SearchType } from 'redux/interfaces/search';
import AppButton from 'components/shared/AppButton/AppButton';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import CircularProgressLoader from 'components/shared/CircularProgressLoader/CircularProgressLoader';
import { StylesType } from './FiltersStyles';

interface FiltersProps extends StylesType {
  searchType?: SearchType;
  datasources: DataSource[];
  fetchDataSourcesList: (
    params: DataSourceApiGetDataSourceListRequest
  ) => Promise<DataSourceList>;
  clearDataEntitySearchFilters: () => void;
  isSearchFacetsUpdating: boolean;
  isDatasourceListFetching: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  classes,
  searchType,
  datasources,
  fetchDataSourcesList,
  clearDataEntitySearchFilters,
  isSearchFacetsUpdating,
  isDatasourceListFetching,
}) => {
  React.useEffect(() => {
    fetchDataSourcesList({ page: 1, size: 100 });
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
          facetOptions={[]}
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
        <div className={classes.facetsLoaderContainer}>
          {(isSearchFacetsUpdating || isDatasourceListFetching) && (
            <CircularProgressLoader text="Updating filters" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
