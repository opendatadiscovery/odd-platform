import { AppPaper, Markdown } from 'components/shared/elements';
import { Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface QueryExampleDetailsOverviewProps {
  definition: string;
  query: string;
}

const QueryExampleDetailsOverview = ({
  definition,
  query,
}: QueryExampleDetailsOverviewProps) => {
  const { t } = useTranslation();

  return (
    <>
      <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
        <Typography variant='h2' mb={1}>
          {t('Definition')}
        </Typography>
        <Markdown value={definition} />
      </AppPaper>
      <AppPaper elevation={0} sx={theme => ({ p: theme.spacing(2), width: '100%' })}>
        <Typography variant='h2' mb={1}>
          {t('Query')}
        </Typography>
        <Markdown value={query} />
      </AppPaper>
    </>
  );
};

export default QueryExampleDetailsOverview;
