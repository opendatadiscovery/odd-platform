import React from 'react';
import { Grid } from '@mui/material';
import { SearchFilter } from 'generated-sources';
import {
  TermSearchFacetStateUpdate,
  TermSearchOptionalFacetNames,
  TermSearchFilterStateSynced,
} from 'redux/interfaces/termSearch';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';

interface FilterItemProps {
  name: string;
  facetName: TermSearchOptionalFacetNames;
  facetOptions: SearchFilter[]; // todo replace with TermsSearchFilter
  selectedOptions: TermSearchFilterStateSynced[] | undefined;
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
        <AppTextField
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${facetName}`}
          value={
            selectedOptions?.length ? selectedOptions[0].entityId : 'All' // todo replace all entityId with termId in this file
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
              maxWidth={190}
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
