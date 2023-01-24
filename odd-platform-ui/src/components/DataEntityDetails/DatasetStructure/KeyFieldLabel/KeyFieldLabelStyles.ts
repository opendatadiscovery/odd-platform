import styled from 'styled-components';
import { Box, type BoxProps } from '@mui/material';

export type DatasetFieldKeyType = 'primary' | 'sort';

interface FilledContainerProps {
  $keyType: DatasetFieldKeyType;
}

export const Container = styled(Box)<BoxProps>(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
}));

export const FilledContainer = styled('span')<FilledContainerProps>(
  ({ theme, $keyType }) => ({
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    borderRadius: '12px',
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.datasetFieldKey[$keyType].background,
    color: theme.palette.common.white,
  })
);
