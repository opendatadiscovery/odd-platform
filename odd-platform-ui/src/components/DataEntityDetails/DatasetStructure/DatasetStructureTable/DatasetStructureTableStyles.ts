import { Grid } from '@mui/material';
import styled from 'styled-components';

export type ColType = 'name' | 'uniq' | 'missing' | 'stats';

export const columnBasicStyles = {
  name: {
    flexGrow: 1,
    width: '68%',
    maxWidth: 'calc(100% - 140px)',
  },
  uniq: {
    display: 'flex',
    flexGrow: 1,
  },
  missing: {
    display: 'flex',
    flexGrow: 1,
  },
  stats: {},
};

export const Container = styled(Grid)(({ theme }) => ({
  position: 'relative',
}));

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...columnBasicStyles[$colType],
}));

export const TableHeader = styled(Grid)(({ theme }) => ({
  color: theme.palette.texts.hint,
  '& > *': {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.backgrounds.primary,
  },
}));
