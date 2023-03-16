import styled from 'styled-components';
import { Box } from '@mui/material';

export const ListItemWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '45%',
}));

export const ListItem = styled('div')<{ $index?: number }>(({ theme, $index }) => ({
  borderTop: $index !== 0 && $index !== 1 ? `2px solid ${theme.palette.divider}` : 'none',
  width: '90%',
  paddingTop: theme.spacing(0.8),
  paddingBottom: theme.spacing(0.8),
  display: 'flex',
  alignItems: 'center',
  p: {
    color: theme.palette.texts.info,
    fontSize: theme.typography.subtitle1.fontSize,
    marginLeft: theme.spacing(0.5),
  },
  h4: { color: theme.palette.texts.primary },
}));
