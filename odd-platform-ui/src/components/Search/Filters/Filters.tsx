import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataSource,
  DataSourceApiGetDataSourceListRequest,
  DataSourceList,
  Namespace,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import { SearchClass } from 'redux/interfaces/search';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import * as S from './FiltersStyles';

interface FiltersProps {
  searchClass?: SearchClass;
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
  searchClass,
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
    <S.Container>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={() => clearDataEntitySearchFilters()}
        >
          Clear All
        </AppButton>
      </Grid>
      <S.ListContainer>
        <SingleFilterItemContainer
          key="ds"
          facetName="datasources"
          name="Datasource"
          facetOptions={datasources}
        />
        {searchClass && searchClass > 0 ? (
          <MultipleFilterItemContainer
            key="st"
            facetName="types"
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
        <S.FacetsLoaderContainer container sx={{ mt: 2 }}>
          {(isSearchFacetsUpdating || isDatasourceListFetching) && (
            <AppCircularProgress size={16} text="Updating filters" />
          )}
        </S.FacetsLoaderContainer>
      </S.ListContainer>
    </S.Container>
  );
};

export default Filters;
