import React from 'react';
import { Typography } from '@mui/material';
import type { SearchFilter, SearchFilterState } from 'generated-sources';
import type { TermSearchOptionalFacetNames } from 'redux/interfaces';
import { Button, TextFormatted } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { changeTermSearchFacet } from 'redux/slices/termSearch.slice';
import * as S from './SelectedFilterOptionStyles';

interface FilterItemProps {
  filter: SearchFilter | SearchFilterState;
  facetName: TermSearchOptionalFacetNames;
}

const SelectedFilterOption: React.FC<FilterItemProps> = ({ filter, facetName }) => {
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
      <Button
        sx={{ ml: 0.5 }}
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </S.Container>
  );
};

export default SelectedFilterOption;
