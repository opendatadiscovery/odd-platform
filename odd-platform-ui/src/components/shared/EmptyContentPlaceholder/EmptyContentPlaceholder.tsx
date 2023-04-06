import React from 'react';
import { Grid, Typography } from '@mui/material';
import { toolbarHeight } from 'lib/constants';
import { NoDataIcon } from 'components/shared/Icons';

interface EmptyContentPlaceholderProps {
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
  offsetTop?: number;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  text = 'No information to display',
  isContentLoaded = true,
  isContentEmpty = true,
  offsetTop = 32,
}) =>
  isContentLoaded && isContentEmpty ? (
    <Grid container height={`calc(100vh - ${toolbarHeight}px - ${offsetTop}px)`}>
      <Grid container alignItems='center' justifyContent='center' flexDirection='column'>
        <Grid item>
          <NoDataIcon width={70} height={70} />
        </Grid>
        <Grid item alignItems='center'>
          <Typography variant='h2'>{text}</Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default EmptyContentPlaceholder;
