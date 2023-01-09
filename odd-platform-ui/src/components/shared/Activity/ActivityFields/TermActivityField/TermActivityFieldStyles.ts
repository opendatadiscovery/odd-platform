import styled from 'styled-components';
import { Grid } from '@mui/material';
import type { CRUDType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const ArrayItemWrapper = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  width: 'max-content',
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
