import { Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SubtitleContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

export const CollapseContainer = styled(Collapse)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
}));
