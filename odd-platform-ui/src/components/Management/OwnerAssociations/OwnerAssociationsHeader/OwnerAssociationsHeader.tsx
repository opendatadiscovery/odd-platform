import React, { useCallback } from 'react';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { Input, NumberFormatted } from 'components/shared/elements';
import { useAppDispatch } from 'redux/lib/hooks';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [query, setQuery] = useAtom(queryAtom);

  const handleSearch = useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchOwnerAssociationRequestList({ page: 1, size, query, active }));
    }, 500),
    [query, active, size]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      handleSearch();
    },
    [handleSearch, setQuery]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  return (
    <>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>{t('Owner associations')}</Typography>
        <Typography variant='subtitle1' color='texts.info'>
          <NumberFormatted value={total} /> {t('requests overall')}
        </Typography>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search requests')}
          maxWidth={340}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={query}
          handleSearchClick={handleSearch}
        />
      </S.Caption>
    </>
  );
};

export default OwnerAssociationsHeader;
