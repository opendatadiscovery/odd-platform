import styled from 'styled-components';
import { Grid, Theme } from '@mui/material';

export type TypeOfChange = 'created' | 'updated' | 'deleted';

const setBackgroundColor = (
  theme: Theme,
  eventType?: TypeOfChange
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
  $typeOfChange?: TypeOfChange;
}>(({ theme, $typeOfChange }) => ({
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
