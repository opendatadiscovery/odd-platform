import React from 'react';
import { useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
import { SearchFilter, SearchFilterState } from 'generated-sources';
import { TermSearchOptionalFacetNames } from 'redux/interfaces';
import * as actions from 'redux/actions';
import TextFormatted from 'components/shared/TextFormatted/TextFormatted';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { Container } from './SelectedFilterOptionStyles';

interface FilterItemProps {
  filter: SearchFilter | SearchFilterState;
  facetName: TermSearchOptionalFacetNames;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({
  filter,
  facetName,
}) => {
  const dispatch = useDispatch();
  const filterId = 'id' in filter ? filter.id : filter.entityId;
  const filterName = 'name' in filter ? filter.name : filter.entityName;
  const onRemoveClick = () => {
    dispatch(
      actions.changeTermSearchFilterAction({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: false,
      })
    );
  };

  return (
    <Container sx={{ mt: 0.5, mx: 0.25 }}>
      <Typography noWrap title={filterName}>
        <TextFormatted value={filterName} />
      </Typography>
      <AppIconButton
        sx={{ ml: 0.5 }}
        size="small"
        color="unfilled"
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </Container>
  );
};

export default SelectedFilterOption;
