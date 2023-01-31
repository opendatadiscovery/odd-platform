import { Box } from '@mui/material';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import styled from 'styled-components';

export const Container = styled(Box)<{
  $typeName: DataSetFieldTypeTypeEnum;
}>(({ theme, $typeName }) => ({
  padding: theme.spacing(0.25, 1),
  border: `1px solid ${theme.palette.structureLabel[$typeName].border}`,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  '& > *': {
    marginRight: theme.spacing(0.5),
    '&:last-child': { marginRight: 0 },
  },
}));

export const Divider = styled('div')(({ theme }) => ({
  width: '1px',
  height: '8px',
  backgroundColor: theme.palette.divider,
}));
