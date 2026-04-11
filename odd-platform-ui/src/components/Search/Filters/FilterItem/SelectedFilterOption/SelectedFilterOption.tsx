import React from 'react';
import { Typography } from '@mui/material';
import type { SearchFilter, SearchFilterState } from 'generated-sources';
import { TextFormatted, Button } from 'components/shared/elements';
import type { OptionalFacetNames } from 'redux/interfaces';
import { ClearIcon } from 'components/shared/icons';
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
