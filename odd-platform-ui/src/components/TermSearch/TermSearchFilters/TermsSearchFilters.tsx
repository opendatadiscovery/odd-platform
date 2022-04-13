import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataSourceApiGetDataSourceListRequest,
  DataSourceList,
  Namespace,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import MultipleFilterItemContainer from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/Search/Filters/FilterItem/SingleFilterItem/SingleFilterItemContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import {
  TermSearchFiltersContainer,
  TermSearchListContainer,
  TermSearchFacetsLoaderContainer,
} from './TermSearchFiltersStyles';

interface FiltersProps {
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

const TermsSearchFilters: React.FC<FiltersProps> = ({
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
    <TermSearchFiltersContainer>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={clearDataEntitySearchFilters}
        >
          Clear All
        </AppButton>
      </Grid>
      <TermSearchListContainer>
        <MultipleFilterItemContainer
          key="tg"
          facetName="tags"
          name="Tag"
        />
        <MultipleFilterItemContainer
          key="ow"
          facetName="owners"
          name="Owner"
        />
        <SingleFilterItemContainer
          key="ns"
          facetName="namespaces"
          name="Namespace"
          facetOptions={namespaces}
        />
        <TermSearchFacetsLoaderContainer container sx={{ mt: 2 }}>
          {(isSearchFacetsUpdating || isDatasourceListFetching) && (
            <AppCircularProgress size={16} text="Updating filters" />
          )}
        </TermSearchFacetsLoaderContainer>
      </TermSearchListContainer>
    </TermSearchFiltersContainer>
  );
};

export default TermsSearchFilters;
