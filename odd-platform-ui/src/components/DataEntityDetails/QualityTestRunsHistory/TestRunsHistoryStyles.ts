import { Grid } from '@mui/material';
import styled from 'styled-components';

export type TestRunHistoryColType = 'sm' | 'md' | 'lg';

export const testRunHistoryColWidthStyles = {
  sm: { flex: '0 0 10%' },
  md: { flex: '1 0 5%' },
  lg: { flex: '5 0 18%' },
};

export const ColContainer = styled(Grid)<{
  $colType: TestRunHistoryColType;
}>(({ $colType }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
  paddingRight: '8px',
  paddingLeft: '8px',
  '&:last-of-type': {
    paddingRight: 0,
  },
  ...testRunHistoryColWidthStyles[$colType],
}));

export const RunsTableHeader = styled(Grid)(({ theme }) => ({
  color: theme.palette.texts.hint,
  '& > *': {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
  },
}));
