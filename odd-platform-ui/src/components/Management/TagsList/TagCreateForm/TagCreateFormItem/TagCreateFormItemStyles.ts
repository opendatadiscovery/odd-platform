import { Checkbox, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ImportantCheckbox = styled(Checkbox)(() => ({
  width: '14px',
  height: '14px',
  padding: 0,
}));

export const TagItemBtnsContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
}));
