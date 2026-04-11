import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const TableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': { padding: theme.spacing(0, 1) },
}));

export const Caption = styled(Grid)(() => ({
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const ScrollContainer = styled('div')<{ $isContentExists: boolean }>(
  ({ theme, $isContentExists }) => ({
    width: '100%',
    height: $isContentExists
      ? `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
          11.5
        )})`
      : 'auto',
    overflowY: 'scroll',
  })
);
