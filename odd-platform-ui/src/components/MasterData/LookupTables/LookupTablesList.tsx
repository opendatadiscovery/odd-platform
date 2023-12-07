import { Typography } from '@mui/material';
import { ScrollableContainer, Table } from 'components/shared/elements';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const LookupTablesList = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useMemo(() => searchParams.get('searchId') ?? '', [searchParams]);
  return (
    <>
      <Table.HeaderContainer>
        <Table.Cell $flex='1 0'>
          <Typography variant='caption'>{t('Table Name')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0 44%'>
          <Typography variant='caption'>{t('Description')}</Typography>
        </Table.Cell>
        <Table.Cell $flex='1 0'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </Table.Cell>
      </Table.HeaderContainer>
      <ScrollableContainer id='lookup-tables-list'>list</ScrollableContainer>
    </>
  );
};

export default LookupTablesList;
