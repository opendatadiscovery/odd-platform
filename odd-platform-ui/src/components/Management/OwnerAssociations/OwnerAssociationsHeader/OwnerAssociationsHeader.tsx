import React from 'react';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { AppInput, NumberFormatted } from 'components/shared/elements';
import { ClearIcon, SearchIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { queryAtom } from '../OwnerAssociationsStore/OwnerAssociationsAtoms';
import * as S from './OwnerAssociationsHeaderStyles';

interface OwnerAssociationsHeaderProps {
  total: number;
  size: number;
  active: boolean;
}

const OwnerAssociationsHeader: React.FC<OwnerAssociationsHeaderProps> = ({
  total,
  size,
  active,
}) => {
  const dispatch = useAppDispatch();

  const [query, setQuery] = useAtom(queryAtom);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchOwnerAssociationRequestList({ page: 1, size, query, active }));
    }, 500),
    [query, active, size]
  );

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      handleSearch();
    },
    [handleSearch, setQuery]
  );

  const handleInputClear = React.useCallback(() => {
    setQuery('');
    handleSearch();
  }, [handleSearch, setQuery]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  return (
    <>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>Owner associations</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={total} /> requests overall
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <AppInput
          placeholder='Search requests...'
          sx={{ minWidth: '340px' }}
          fullWidth={false}
          value={query}
          customStartAdornment={{
            variant: 'search',
            showAdornment: true,
            onCLick: handleSearch,
            icon: <SearchIcon />,
          }}
          customEndAdornment={{
            variant: 'clear',
            showAdornment: !!query,
            onCLick: handleInputClear,
            icon: <ClearIcon />,
          }}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
      </S.Caption>
    </>
  );
};

export default OwnerAssociationsHeader;
