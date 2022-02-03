import React from 'react';
import { Grid } from '@mui/material';
import { SearchFilter } from 'generated-sources';
import {
  FacetStateUpdate,
  OptionalFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces/search';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
  facetOptions: SearchFilter[];
  selectedOptions: SearchFilterStateSynced[] | undefined;
  setFacets: (option: FacetStateUpdate) => void;
}

const SingleFilterItem: React.FC<FilterItemProps> = ({
  name,
  facetName,
  facetOptions,
  selectedOptions,
  setFacets,
}) => {
  const handleFilterSelect = React.useCallback(
    (option: { id: number | string; name: string }) => {
      setFacets({
        facetName,
        facetOptionId: option.id,
        facetOptionName: option.name,
        facetOptionState: true,
        facetSingle: true,
      });
    },
    [setFacets, facetName]
  );

  return facetOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppTextField
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${facetName}`}
          value={
            selectedOptions?.length ? selectedOptions[0].entityId : 'All'
          }
        >
          <AppMenuItem
            value="All"
            onClick={() => handleFilterSelect({ id: 'All', name: 'All' })}
          >
            All
          </AppMenuItem>
          {facetOptions?.map(option => (
            <AppMenuItem
              key={option.id}
              value={option.id}
              onClick={() => handleFilterSelect(option)}
            >
              {option.name}
            </AppMenuItem>
          ))}
        </AppTextField>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilterItem;
