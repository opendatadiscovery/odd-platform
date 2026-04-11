import styled from 'styled-components';
import type { EventType } from 'lib/interfaces';
import { setActivityBackgroundColor } from 'lib/helpers';

export const ArrayItemWrapper = styled('div')<{
  $typeOfChange?: EventType;
}>(({ theme, $typeOfChange }) => ({
  marginTop: theme.spacing(0.25),
  padding: theme.spacing(0.5),
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  width: 'max-content',
  borderRadius: '4px',
  backgroundColor: $typeOfChange
    ? setActivityBackgroundColor(theme, $typeOfChange)
    : 'transparent',
}));
