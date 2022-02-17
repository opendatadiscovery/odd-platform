import styled from 'styled-components';
import { Box } from '@mui/material';

export const LabelItemsContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
}));
