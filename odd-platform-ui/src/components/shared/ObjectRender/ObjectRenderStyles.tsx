import React from 'react';
import styled from 'styled-components';
import { Typography, type TypographyProps } from '@mui/material';

type PivotSpanProps = Omit<TypographyProps, 'component'>;

export const ObjectRenderSpan = (props: PivotSpanProps) => (
  <Typography component='span' {...props} />
);

ObjectRenderSpan.displayName = 'ObjectRenderSpan';

type ObjectRenderInteractiveSpanProps = {
  $interactive?: boolean;
};

export const ObjectRenderInteractiveSpan = styled(
  ObjectRenderSpan
)<ObjectRenderInteractiveSpanProps>(({ $interactive }) =>
  $interactive ? { cursor: 'pointer' } : {}
);

ObjectRenderInteractiveSpan.displayName = 'ObjectRenderInteractiveSpan';

type ObjectRenderKeyProps = ObjectRenderInteractiveSpanProps & {
  $deep: number;
};

export const ObjectRenderKey = styled(ObjectRenderInteractiveSpan)<ObjectRenderKeyProps>(
  ({ theme, $deep, $interactive }) => ({
    color: theme.palette.texts.action,
    marginLeft: theme.spacing($deep + 1),
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.25),
    ...($interactive && {
      '&:hover, &:focus': {
        background: theme.palette.button.tertiary.hover.background,
      },
    }),
  })
);

ObjectRenderKey.displayName = 'ObjectRenderKey';
