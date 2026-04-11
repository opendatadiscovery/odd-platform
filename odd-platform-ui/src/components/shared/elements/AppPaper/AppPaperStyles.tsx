import styled from 'styled-components';
import { Paper, paperClasses } from '@mui/material';

export const AppPapper = styled(Paper)(({ theme }) => ({
  border: ' 1px solid',
  borderColor: theme.palette.backgrounds.secondary,
  borderRadius: '8px',
  [`& .${paperClasses.elevation9}`]: { borderRadius: '8px' },
}));
