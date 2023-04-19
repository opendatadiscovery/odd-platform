import styled, { type CSSObject } from 'styled-components';
import { DropdownIcon } from 'components/shared/icons';
import { Grid } from '@mui/material';
import { type CSSProperties } from 'react';

export const SeparatorIcon = styled(DropdownIcon)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  transform: 'rotate(-90deg)',
}));

export const Container = styled(Grid)(
  () =>
    ({
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      alignItems: 'center',
      height: '100%',
    } as CSSObject)
);

export const StateContainer = styled(Grid)<{
  $stateDirection: CSSProperties['flexDirection'];
}>(({ theme, $stateDirection }) => ({
  flexDirection: $stateDirection,
  flexWrap: 'wrap' as const,
  alignContent: $stateDirection === 'column' ? 'flex-start' : 'center',
  alignItems: $stateDirection === 'column' ? 'flex-start' : 'center',
  padding: theme.spacing(1.5),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '4px',
  height: '100%',
  '& > *': { marginRight: '4px' },
}));
