import React from 'react';
import { Typography } from '@mui/material';
import { SearchFilter, SearchFilterState } from 'generated-sources';
import { TermSearchOptionalFacetNames } from 'redux/interfaces';
import { AppIconButton, TextFormatted } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { changeTermSearchFacet } from 'redux/slices/termSearch.slice';
import * as S from './SelectedFilterOptionStyles';

interface FilterItemProps {
  filter: SearchFilter | SearchFilterState;
  facetName: TermSearchOptionalFacetNames;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({
  filter,
  facetName,
}) => {
  const dispatch = useAppDispatch();

  const filterId = 'id' in filter ? filter.id : filter.entityId;
  const filterName = 'name' in filter ? filter.name : filter.entityName;
  const onRemoveClick = () => {
    dispatch(
      changeTermSearchFacet({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: false,
      })
    );
  };

  return (
    <S.Container sx={{ mt: 0.5, mx: 0.25 }}>
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
    </S.Container>
  );
};

export default SelectedFilterOption;
