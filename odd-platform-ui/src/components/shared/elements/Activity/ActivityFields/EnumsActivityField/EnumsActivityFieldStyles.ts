import styled from 'styled-components';
import { Grid } from '@mui/material';
import type { EventType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const ArrayItemWrapper = styled(Grid)<{
  $typeOfChange?: EventType;
}>(({ theme, $typeOfChange }) => ({
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  width: 'max-content',
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
