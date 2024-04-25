import { Grid, Typography } from '@mui/material';
import type { TermRef } from 'generated-sources';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyContentPlaceholder } from 'components/shared/elements';
import QueryExampleDetailsLinkedTermsItem from './QuertExampleDetailsLinkedTermsItem';

interface QueryExampleDetailsLinkedTermsProps {
  terms: TermRef[];
}

const QueryExampleDetailsLinkedTerms = ({
  terms,
}: QueryExampleDetailsLinkedTermsProps) => {
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid
        container
        sx={theme => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
        wrap='nowrap'
      >
        <Grid item xs={2} pl={1}>
          <Typography variant='caption'>{t('Name')}</Typography>
        </Grid>
        <Grid item xs={4} pl={1}>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </Grid>
      </Grid>
      {terms.map(term => (
        <QueryExampleDetailsLinkedTermsItem term={term} key={term.id} />
      ))}
      {terms.length === 0 && <EmptyContentPlaceholder />}
    </Grid>
  );
};

export default QueryExampleDetailsLinkedTerms;
