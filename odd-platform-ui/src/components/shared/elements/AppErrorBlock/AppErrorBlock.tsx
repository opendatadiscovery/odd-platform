import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { AppError } from 'lib/errorHandling';
import { getErrorResponse } from 'lib/errorHandling';
import { AlertIcon } from 'components/shared/icons';

interface AppErrorBlockProps {
  errResponse?: unknown;
}

const AppErrorBlock: React.FC<AppErrorBlockProps> = ({ errResponse }) => {
  const [error, setError] = React.useState<AppError | undefined>(undefined);

  React.useEffect(() => {
    getErrorResponse(errResponse as Response)
      .then(err => setError(err))
      .catch(() => {});
  }, []);

  return (
    <Grid container alignItems='center' justifyContent='center'>
      <Grid display='flex' flexWrap='nowrap' alignItems='center' justifyContent='center'>
        <AlertIcon fill='#A8B0BD' width='8%' height='auto' />
        <Grid ml={1} display='flex' flexDirection='column'>
          <Typography variant='subtitle1'>Error loading data block</Typography>
          {error && (
            <Grid display='flex' flexWrap='nowrap'>
              <Typography variant='subtitle1' sx={{ mr: 0.5 }}>
                {error.status}
              </Typography>
              <Typography variant='subtitle1'>{error.message}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AppErrorBlock;
