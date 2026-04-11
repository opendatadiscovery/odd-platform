import styled from 'styled-components';
import { Grid } from '@mui/material';

export type ColType = 'col' | 'colxs' | 'colsm' | 'colmd' | 'collg';
export const colWidthStyles = {
  colxs: { flex: '2 0 6%' },
  colsm: { flex: '2 0 7%' },
  colmd: { flex: '3 0 9%' },
  collg: { flex: '4 0 12%' },
  col: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: '8px',
    paddingLeft: '8px',
    '&:last-of-type': { paddingRight: 0 },
  },
};

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({ ...colWidthStyles.col, ...colWidthStyles[$colType] }));
