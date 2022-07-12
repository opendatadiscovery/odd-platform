import { Grid, Theme } from '@mui/material';
import styled from 'styled-components';
import { ActivityEventType } from 'generated-sources';

interface ContainerProps {
  $eventType?: ActivityEventType;
  $isChanged?: boolean;
}

const setBackgroundColor = (
  theme: Theme,
  eventType?: ActivityEventType
): string => {
  switch (eventType) {
    case ActivityEventType.OWNERSHIP_CREATED:
      return theme.palette.activityEvent.created;
    case ActivityEventType.OWNERSHIP_UPDATED:
      return theme.palette.activityEvent.updated;
    case ActivityEventType.OWNERSHIP_DELETED:
      return theme.palette.activityEvent.deleted;
    default:
      return '';
  }
};

export const Container = styled(Grid)<ContainerProps>(
  ({ theme, $eventType, $isChanged }) => ({
    flexWrap: 'nowrap',
    width: 'max-content',
    borderRadius: '4px',
    backgroundColor: $isChanged
      ? setBackgroundColor(theme, $eventType)
      : 'transparent',
  })
);
