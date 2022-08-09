import React from 'react';
import { Grid } from '@mui/material';
import { SearchFilter } from 'generated-sources';
import {
  OptionalFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces/dataEntitySearch';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch } from 'lib/redux/hooks';
import { changeDataEntitySearchFacet } from 'redux/reducers/dataEntitySearch.slice';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
  facetOptions: SearchFilter[];
  selectedOptions: SearchFilterStateSynced[] | undefined;
  // setFacets: (option: FacetStateUpdate) => void;
}

const SingleFilterItem: React.FC<FilterItemProps> = ({
  name,
  facetName,
  facetOptions,
  selectedOptions,
  // setFacets,
}) => {
  const dispatch = useAppDispatch();

  const handleFilterSelect = React.useCallback(
    (option: { id: number | string; name: string }) => {
      dispatch(
        changeDataEntitySearchFacet({
          facetName,
          facetOptionId: option.id,
          facetOptionName: option.name,
          facetOptionState: true,
          facetSingle: true,
        })
      );
    },
    // TODO check changeDataEntitySearchFacet deps
    [changeDataEntitySearchFacet, facetName]
  );

  return facetOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppSelect
          sx={{ mt: 2 }}
          label={name}
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
        </AppSelect>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilterItem;
