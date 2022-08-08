import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(2.5),
}));

export const TableHeader = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  color: theme.palette.texts.hint,
  borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
}));

export const TableCell = styled(Grid)(({ theme }) => ({
  paddingLeft: theme.spacing(1),
}));
