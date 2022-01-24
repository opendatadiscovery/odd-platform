import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const LabelItemsContainer = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
}));
