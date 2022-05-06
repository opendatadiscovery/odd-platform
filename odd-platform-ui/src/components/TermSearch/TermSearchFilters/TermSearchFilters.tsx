import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Namespace,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import MultipleFilterItemContainer from 'components/TermSearch/TermSearchFilters/TermSearchFilterItem/MultipleFilterItem/MultipleFilterItemContainer';
import SingleFilterItemContainer from 'components/TermSearch/TermSearchFilters/TermSearchFilterItem/SingleFilterItem/SingleFilterItemContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import {
  TermSearchFiltersContainer,
  TermSearchListContainer,
  TermSearchFacetsLoaderContainer,
} from './TermSearchFiltersStyles';

interface FiltersProps {
  namespaces: Namespace[];
  fetchNamespaceList: (
    params: NamespaceApiGetNamespaceListRequest
  ) => void;
  clearTermSearchFilters: () => void;
  isTermSearchFacetsUpdating: boolean;
}

const TermSearchFilters: React.FC<FiltersProps> = ({
  namespaces,
  fetchNamespaceList,
  clearTermSearchFilters,
  isTermSearchFacetsUpdating,
}) => {
  React.useEffect(() => {
    fetchNamespaceList({ page: 1, size: 100 });
  }, []);

  return (
    <TermSearchFiltersContainer>
      <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h4">Filters</Typography>
        <AppButton
          color="tertiary"
          size="medium"
          onClick={clearTermSearchFilters}
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
          {isTermSearchFacetsUpdating && (
            <AppCircularProgress size={16} text="Updating filters" />
          )}
        </TermSearchFacetsLoaderContainer>
      </TermSearchListContainer>
    </TermSearchFiltersContainer>
  );
};

export default TermSearchFilters;
