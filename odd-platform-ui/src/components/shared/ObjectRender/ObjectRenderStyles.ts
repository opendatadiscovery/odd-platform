import styled from 'styled-components';
import { Typography } from '@mui/material';
import { ElementType } from 'react';

type KeyProps = {
  $deep: number;
  $interactive: boolean;
  component: ElementType;
};

export const ObjectRenderKey = styled(Typography)<KeyProps>(
  ({ theme, $deep, $interactive }) => ({
    color: theme.palette.texts.action,
    marginLeft: theme.spacing($deep + 1),
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.25),
    ...($interactive && {
      cursor: 'pointer',
      '&:hover': {
        background: theme.palette.button.tertiary.hover.background,
      },
    }),
  })
);

ObjectRenderKey.displayName = 'ObjectRenderKey';
