import { Grid, Theme } from '@mui/material';
import styled from 'styled-components';
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

export const Container = styled(Grid)<{
  $typeOfChange?: CRUDType;
}>(({ theme, $typeOfChange }) => ({
  flexWrap: 'nowrap',
  width: 'max-content',
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
