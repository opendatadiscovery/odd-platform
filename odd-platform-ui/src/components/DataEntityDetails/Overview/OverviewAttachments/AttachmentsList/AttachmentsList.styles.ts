import styled from 'styled-components';
import { Grid } from '@mui/material';

export const CollapseFooter = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const ListContainer = styled(Grid)<{ $multiline?: boolean }>(
  ({ theme, $multiline }) => ({
    rowGap: theme.spacing(4),
    columnGap: theme.spacing(2),
    marginTop: theme.spacing($multiline ? 4 : 0),
  })
);
