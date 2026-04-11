import styled from 'styled-components';
import { Box, type BoxProps } from '@mui/material';
import type { DatasetFieldKey } from 'lib/interfaces';

interface FilledContainerProps {
  $keyType: DatasetFieldKey;
}

export const Container = styled(Box)<BoxProps>(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
}));

export const FilledContainer = styled('span')<FilledContainerProps>(
  ({ theme, $keyType }) => ({
    fontSize: '10px',
    lineHeight: '11px',
    borderRadius: '9px',
    fontWeight: 500,
    padding: theme.spacing(0.3125, 0.625),
    backgroundColor: theme.palette.datasetFieldKey[$keyType].background,
    color: theme.palette.datasetFieldKey[$keyType].color,
  })
);
