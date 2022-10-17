import React from 'react';
import { Typography } from '@mui/material';
import { SearchFilter, SearchFilterState } from 'generated-sources';
import { TextFormatted, AppIconButton } from 'components/shared';
import { OptionalFacetNames } from 'redux/interfaces/dataEntitySearch';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import * as S from './SelectedFilterOptionStyles';

interface FilterItemProps {
  filter: SearchFilter | SearchFilterState;
  facetName: OptionalFacetNames;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({ filter, facetName }) => {
  const dispatch = useAppDispatch();

  const filterId = 'id' in filter ? filter.id : filter.entityId;
  const filterName = 'name' in filter ? filter.name : filter.entityName;

  const onRemoveClick = () => {
    dispatch(
      changeDataEntitySearchFacet({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: false,
      })
    );
  };

  return (
    <S.Container>
      <Typography noWrap title={filterName}>
        <TextFormatted value={filterName} />
      </Typography>
      <AppIconButton
        sx={{ ml: 0.5 }}
        size='small'
        color='unfilled'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </S.Container>
  );
};

export default SelectedFilterOption;
