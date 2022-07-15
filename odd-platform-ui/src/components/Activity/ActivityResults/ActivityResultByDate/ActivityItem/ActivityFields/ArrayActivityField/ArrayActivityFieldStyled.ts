import styled from 'styled-components';
import { Grid, Theme } from '@mui/material';
import { CRUDType } from 'lib/interfaces';

const setBackgroundColor = (
  theme: Theme,
  eventType?: CRUDType
): string => {
  switch (eventType) {
    case 'created':
      return theme.palette.activityEvent.created;
    case 'updated':
      return theme.palette.activityEvent.updated;
    case 'deleted':
      return theme.palette.activityEvent.deleted;
    default:
      return '';
  }
};

export const ArrayItemWrapper = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
