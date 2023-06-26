import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { NoDataIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';

interface EmptyContentPlaceholderProps {
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
  offsetTop?: number;
  fullPage?: boolean;
}

const EmptyContentPlaceholder: FC<EmptyContentPlaceholderProps> = ({
  text,
  isContentLoaded = true,
  isContentEmpty = true,
  offsetTop = 32,
  fullPage = true,
}) => {
  const { t } = useTranslation();

  return isContentLoaded && isContentEmpty ? (
    <Grid container sx={{ height: fullPage ? `calc(100vh - ${offsetTop}px)` : 'auto' }}>
      <Grid container alignItems='center' justifyContent='center' flexDirection='column'>
        <Grid item>
          <NoDataIcon width={70} height={70} />
        </Grid>
        <Grid item alignItems='center'>
          <Typography variant={fullPage ? 'h2' : 'h4'}>
            {text ?? t('No information to display')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : null;
};

export default EmptyContentPlaceholder;
