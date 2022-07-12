import styled from 'styled-components';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { Grid } from '@mui/material';

export const SeparatorIcon = styled(DropdownIcon)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  transform: 'rotate(-90deg)',
}));

export const Container = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  alignItems: 'center',
  height: '100%',
}));

export const StateContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  padding: theme.spacing(1.5),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '4px',
  height: '100%',
  '& > *': {
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    '&:last-child': { marginBottom: 0 },
  },
}));
