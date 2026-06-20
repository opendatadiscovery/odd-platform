import React from 'react';
import { Typography } from '@mui/material';
import { ClearIcon } from 'components/shared/icons';
import { type ActivityFilterOption } from 'components/shared/elements/Activity/common';
import { useQueryParams } from 'lib/hooks';
import TextFormatted from 'components/shared/elements/TextFormatted/TextFormatted';
import { Container } from 'components/shared/elements/Activity/ActivityFilterItems/MultipleFilter/SelectedFilterOption/SelectedFilterOptionStyles';
import Button from 'components/shared/elements/Button/Button';

// Generic over the page's query shape so the removable chip works for both Activity and Alerts.
interface SelectedFilterOptionProps<Q extends object> {
  selectedOption: ActivityFilterOption;
  filterName: keyof Q & string;
  defaultQuery: Q;
}

const SelectedFilterOption = <Q extends object>({
  selectedOption,
  filterName,
  defaultQuery,
}: SelectedFilterOptionProps<Q>) => {
  const { setQueryParams } = useQueryParams<Q>(defaultQuery);

  const onRemoveClick = () => {
    // filterName spans number[] (tagIds/ownerIds) and string[] (usernames, #1657); the heterogeneous
    // union defeats inference on the computed key, so assert the pruned query is well-formed.
    setQueryParams(
      prev =>
        ({
          ...prev,
          [filterName]: (
            (prev as Record<string, unknown>)[filterName] as
              | Array<number | string>
              | undefined
          )?.filter(id => id !== selectedOption.id),
        }) as Q
    );
  };

  return (
    <Container sx={{ mt: 0.5, mx: 0.25 }}>
      <Typography noWrap title={selectedOption.name}>
        <TextFormatted value={selectedOption.name} />
      </Typography>
      <Button
        sx={{ ml: 0.5 }}
        buttonType='linkGray-m'
        icon={<ClearIcon />}
        onClick={onRemoveClick}
      />
    </Container>
  );
};

export default SelectedFilterOption;
