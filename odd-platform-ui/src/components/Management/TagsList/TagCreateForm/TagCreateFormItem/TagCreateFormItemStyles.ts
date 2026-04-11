import { Grid } from '@mui/material';
import styled from 'styled-components';

export const TagItemBtnsContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
}));
