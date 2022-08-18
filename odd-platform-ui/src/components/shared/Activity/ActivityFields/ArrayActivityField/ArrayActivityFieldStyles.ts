import styled from 'styled-components';
import { Grid } from '@mui/material';
import { CRUDType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const ArrayItemWrapper = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  width: 'max-content',
  borderRadius: '4px',
  padding: theme.spacing($typeOfChange ? 0.5 : 0),
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
