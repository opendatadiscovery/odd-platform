import React from 'react';
import { Grid, Typography } from '@mui/material';
import { NoDataIcon } from 'components/shared/icons';

interface EmptyContentPlaceholderProps {
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
  offsetTop?: number;
  fullPage?: boolean;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  text = 'No information to display',
  isContentLoaded = true,
  isContentEmpty = true,
  offsetTop = 32,
  fullPage = true,
}) =>
  isContentLoaded && isContentEmpty ? (
    <Grid container sx={{ height: fullPage ? `calc(100vh - ${offsetTop}px)` : 'auto' }}>
      <Grid container alignItems='center' justifyContent='center' flexDirection='column'>
        <Grid item>
          <NoDataIcon width={70} height={70} />
        </Grid>
        <Grid item alignItems='center'>
          <Typography variant={fullPage ? 'h2' : 'h4'}>{text}</Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default EmptyContentPlaceholder;
