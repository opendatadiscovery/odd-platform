import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, NumberFormatted, Table } from 'components/shared/elements';
import LookupTablesSearchInput from './LookupTables/LookupTablesSearchInput';
import { AddIcon } from '../shared/icons';

const LookupTables: React.FC = () => {
  const { t } = useTranslation();
  const totalLookupTables = 0;

  return (
    <Grid
      container
      flexDirection='column'
      justifyContent='center'
      mt={1}
      px={2}
      py={1}
      gap={2}
    >
      <Grid item container flexDirection='column' gap={1}>
        <Grid item container alignItems='center' justifyContent='space-between'>
          <Typography variant='h1'>{t('Lookup Tables')}</Typography>
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={totalLookupTables} /> {t('lookup tables overall')}
          </Typography>
        </Grid>
        <Grid item container alignItems='center' justifyContent='space-between'>
          <LookupTablesSearchInput />
          <Button text={t('Add new')} buttonType='main-lg' startIcon={<AddIcon />} />
        </Grid>
      </Grid>
      <Grid item>
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
      </Grid>
    </Grid>
  );
};

export default LookupTables;
