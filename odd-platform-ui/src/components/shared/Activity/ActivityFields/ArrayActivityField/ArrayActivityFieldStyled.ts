import styled from 'styled-components';
import { Grid } from '@mui/material';
import { CRUDType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const ArrayItemWrapper = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  width: 'max-content',
  borderRadius: '4px',
  marginRight: theme.spacing($typeOfChange ? 0.5 : 0),
  marginLeft: theme.spacing($typeOfChange ? 0.5 : 0),
  padding: theme.spacing($typeOfChange ? 0.5 : 0),
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
