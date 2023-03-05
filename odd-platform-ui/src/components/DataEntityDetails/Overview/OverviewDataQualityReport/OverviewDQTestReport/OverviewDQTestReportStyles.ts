import { Grid } from '@mui/material';
import styled from 'styled-components';
import { type DataEntityRunStatus } from 'generated-sources';

export const Container = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));

export const BarContainer = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  marginTop: theme.spacing(1),
  columnGap: '1px',
  '*:first-child': {
    borderTopLeftRadius: '2px',
    borderBottomLeftRadius: '2px',
  },
  '*:last-child': {
    borderTopRightRadius: '2px',
    borderBottomRightRadius: '2px',
  },
}));

export const Bar = styled('div')<{
  $runStatus: string;
  $runCount: number;
  $total: number | undefined;
}>(({ theme, $runStatus, $runCount, $total }) => {
  const runStatusPaletteKey = $runStatus
    .replace('Total', '')
    .toUpperCase() as DataEntityRunStatus;

  const relation = Math.round((100 * ($runCount || 0)) / ($total || 1));

  return {
    backgroundColor: theme.palette.runStatus[runStatusPaletteKey].color,
    height: '8px',
    width: '100%',
    maxWidth: `${relation}%`,
  };
});

export const CountContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(0.5),
}));

export const Count = styled('div')<{
  $runStatus: DataEntityRunStatus;
}>(({ theme, $runStatus }) => {
  const runStatusPaletteKey = $runStatus
    .replace('Total', '')
    .toUpperCase() as DataEntityRunStatus;

  return {
    backgroundColor: theme.palette.runStatus[runStatusPaletteKey].background,
    color: theme.palette.runStatus[runStatusPaletteKey].color,
    borderRadius: '16px',
    padding: theme.spacing(0, 1),
    width: 'fit-content',
  };
});
