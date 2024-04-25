import { Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Table from '../StyledComponents/Table';

const QueryExamplesListHeader = () => {
  const { t } = useTranslation();

  return (
    <Table.HeaderContainer>
      <Table.Cell $flex='1 0 1'>
        <Typography variant='caption'>#</Typography>
      </Table.Cell>
      <Table.Cell $flex='1 0 15%'>
        <Typography variant='caption'>{t('Definition')}</Typography>
      </Table.Cell>
      <Table.Cell $flex='1 0 25%'>
        <Typography variant='caption'>{t('Query')}</Typography>
      </Table.Cell>
      <Table.Cell $flex='1 0 5%'>
        <Typography variant='caption'>{t('Linked entities')}</Typography>
      </Table.Cell>
      <Table.Cell $flex='1 0 5%'>
        <Typography variant='caption'>Linked terms</Typography>
      </Table.Cell>
      <Table.Cell $flex='0 0 15%' />
    </Table.HeaderContainer>
  );
};

export default QueryExamplesListHeader;
