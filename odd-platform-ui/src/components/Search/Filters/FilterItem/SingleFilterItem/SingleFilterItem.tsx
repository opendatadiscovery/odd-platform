import React from 'react';
import { Grid, Typography, Select, MenuItem } from '@mui/material';
import { SearchFilter } from 'generated-sources';
import {
  FacetStateUpdate,
  OptionalFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces/search';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { StylesType } from './SingleFilterItemStyles';

interface FilterItemProps extends StylesType {
  name: string;
  facetName: OptionalFacetNames;
  facetOptions: SearchFilter[];
  selectedOptions: SearchFilterStateSynced[] | undefined;
  setFacets: (option: FacetStateUpdate) => void;
}

const SingleFilterItem: React.FC<FilterItemProps> = ({
  classes,
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
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Typography
          variant="h5"
          id={`${facetName}-select-label`}
          className={classes.caption}
        >
          {name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Select
          className={classes.singleSelect}
          IconComponent={DropdownIcon}
          labelId={`${facetName}-select-label`}
          id={`filter-${facetName}`}
          variant="outlined"
          value={
            selectedOptions?.length ? selectedOptions[0].entityId : 'All'
          }
        >
          <MenuItem
            value="All"
            onClick={() => handleFilterSelect({ id: 'All', name: 'All' })}
          >
            All
          </MenuItem>
          {facetOptions?.map(option => (
            <MenuItem
              key={option.id}
              value={option.id}
              onClick={() => handleFilterSelect(option)}
            >
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilterItem;
