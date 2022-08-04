import React from 'react';
import { Grid } from '@mui/material';
import { SearchFilter } from 'generated-sources';
import { SearchFilterStateSynced } from 'redux/interfaces/search';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import {
  TermSearchFacetStateUpdate,
  TermSearchOptionalFacetNames,
} from 'redux/interfaces';

interface FilterItemProps {
  name: string;
  facetName: TermSearchOptionalFacetNames;
  facetOptions: SearchFilter[];
  selectedOptions: SearchFilterStateSynced[] | undefined;
  setFacets: (option: TermSearchFacetStateUpdate) => void;
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
        <AppSelect
          sx={{ mt: 2 }}
          label={name}
          id={`term-search-filter-${facetName}`}
          value={
            selectedOptions?.length ? selectedOptions[0].entityId : 'All'
          }
        >
          <AppMenuItem
            value="All"
            maxWidth={190}
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
        </AppSelect>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilterItem;
