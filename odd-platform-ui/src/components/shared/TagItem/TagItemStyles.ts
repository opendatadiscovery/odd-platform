import { Typography } from '@mui/material';
import styled from 'styled-components';

interface ContainerProps {
  $important?: boolean;
  $removable?: boolean;
  $cursorPointer?: boolean;
  $systemTag?: boolean;
}

export const Container = styled(Typography)<ContainerProps>(
  ({ theme, $important, $removable, $cursorPointer, $systemTag }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: '4px',
    padding: theme.spacing(0.25, 1),
    backgroundColor:
      theme.palette.backgrounds[$systemTag ? 'secondary' : 'default'],
    paddingRight: $removable ? theme.spacing(0.5) : '',
    color: $systemTag
      ? theme.palette.texts.secondary
      : theme.palette.tag.main.normal.color,
    borderColor:
      theme.palette.tag[$important ? 'important' : 'main'].normal.border,
    '&:hover, &:active': {
      cursor: $cursorPointer ? 'pointer' : 'auto',
      borderColor:
        theme.palette.tag[$important ? 'important' : 'main'].hover.border,
    },
  })
);
