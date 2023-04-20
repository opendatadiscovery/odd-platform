import React from 'react';
import { Grid } from '@mui/material';
import type { SearchFilter } from 'generated-sources';
import type { OptionalFacetNames } from 'redux/interfaces';
import { AppMenuItem, AppSelect } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import { getSelectedSearchFacetOptions } from 'redux/selectors';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
  facetOptions: SearchFilter[];
}

const SingleFilterItem: React.FC<FilterItemProps> = ({
  name,
  facetName,
  facetOptions,
}) => {
  const dispatch = useAppDispatch();
  const selectedOptions = useAppSelector(getSelectedSearchFacetOptions(facetName));

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
    [facetName]
  );

  return facetOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppSelect
          sx={{ mt: 2 }}
          label={name}
          maxMenuHeight={464}
          id={`filter-${facetName}`}
          value={selectedOptions?.length ? selectedOptions[0].entityId : 'All'}
        >
          <AppMenuItem
            value='All'
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
