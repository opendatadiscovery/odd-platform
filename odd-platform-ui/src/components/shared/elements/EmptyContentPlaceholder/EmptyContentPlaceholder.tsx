import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { NoDataIcon } from 'components/shared/icons';
import type { SxProps, Theme } from '@mui/system';
import { useTranslation } from 'react-i18next';

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

const EmptyContentPlaceholder: FC<EmptyContentPlaceholderProps> = ({
  position = 'vertical',
  text,
  iconSize = 70,
  isContentLoaded = true,
  isContentEmpty = true,
  offsetTop = 32,
  fullPage = true,
  sx,
}) => {
  const { t } = useTranslation();

  return isContentLoaded && isContentEmpty ? (
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
          <Typography variant={fullPage ? 'h2' : 'h4'}>
            {text ?? t('No information to display')}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : null;
};

export default EmptyContentPlaceholder;
