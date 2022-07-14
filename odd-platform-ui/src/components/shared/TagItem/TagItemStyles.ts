import { Typography } from '@mui/material';
import styled from 'styled-components';

interface ContainerProps {
  $important?: boolean;
  $cursorPointer?: boolean;
  $systemTag?: boolean;
}

export const Container = styled(Typography)<ContainerProps>(
  ({ theme, $important, $cursorPointer, $systemTag }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: '4px',
    padding: theme.spacing(0.25, 1),
    backgroundColor: theme.palette.backgrounds.default,
    color: $systemTag
      ? theme.palette.texts.info
      : theme.palette.texts.primary,
    borderColor:
      theme.palette.tag[$important ? 'important' : 'main'].normal.border,
    '&:hover, &:active': {
      cursor: $cursorPointer ? 'pointer' : 'auto',
      borderColor:
        theme.palette.tag[$important ? 'important' : 'main'].hover.border,
    },
  })
);

export const SystemIconContainer = styled('span')<ContainerProps>(
  ({ theme }) => ({
    marginRight: theme.spacing(0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    svg: {
      height: theme.spacing(1.5),
      width: theme.spacing(1.5),
    },
  })
);
