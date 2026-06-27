import { Typography } from '@mui/material';
import styled from 'styled-components';

interface ContainerProps {
  $important?: boolean;
  $cursorPointer?: boolean;
  $systemTag?: boolean;
  $selected?: boolean;
}

export const Container = styled(Typography)<ContainerProps>(
  ({ theme, $important, $cursorPointer, $systemTag, $selected }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: '4px',
    padding: theme.spacing(0.25, 1),
    backgroundColor: $selected
      ? theme.palette.backgrounds.secondary
      : theme.palette.backgrounds.default,
    color: $systemTag ? theme.palette.texts.info : theme.palette.texts.primary,
    borderColor:
      theme.palette.tag[$important ? 'important' : 'main'][$selected ? 'hover' : 'normal']
        .border,
    '&:hover, &:active': {
      cursor: $cursorPointer ? 'pointer' : 'auto',
      borderColor: theme.palette.tag[$important ? 'important' : 'main'].hover.border,
    },
  })
);
