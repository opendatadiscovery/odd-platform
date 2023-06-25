import React from 'react';
import { Grid, Typography } from '@mui/material';
import { NoDataIcon } from 'components/shared/icons';
import type { SxProps, Theme } from '@mui/system';

interface EmptyContentPlaceholderProps {
  position?: 'vertical' | 'horizontal';
  iconSize?: number;
  text?: string;
  isContentLoaded?: boolean;
  isContentEmpty?: boolean;
  offsetTop?: number;
  fullPage?: boolean;
  sx?: SxProps<Theme>;
}

const EmptyContentPlaceholder: React.FC<EmptyContentPlaceholderProps> = ({
  position = 'vertical',
  text = 'No information to display',
  iconSize = 70,
  isContentLoaded = true,
  isContentEmpty = true,
  offsetTop = 32,
  fullPage = true,
  sx,
}) =>
  isContentLoaded && isContentEmpty ? (
    <Grid
      container
      sx={{ height: fullPage ? `calc(100vh - ${offsetTop}px)` : 'auto', ...sx }}
    >
      <Grid
        container
        alignItems='center'
        justifyContent='center'
        flexDirection={position === 'vertical' ? 'column' : 'row'}
      >
        <Grid item sx={{ display: 'flex', mr: 1 }}>
          <NoDataIcon width={iconSize} height={iconSize} />
        </Grid>
        <Grid item alignItems='center'>
          <Typography variant={fullPage ? 'h2' : 'h4'}>{text}</Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default EmptyContentPlaceholder;
