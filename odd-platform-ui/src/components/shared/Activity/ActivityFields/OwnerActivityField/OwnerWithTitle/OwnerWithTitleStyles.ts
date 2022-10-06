import { Grid } from '@mui/material';
import styled from 'styled-components';
import { CRUDType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const Container = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  flexWrap: 'nowrap',
  width: 'max-content',
  borderRadius: '4px',
  padding: theme.spacing(0.5),
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
