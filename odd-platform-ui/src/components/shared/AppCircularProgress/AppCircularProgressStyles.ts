import { CircularProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import {
  Background,
  ProgressBackground,
} from 'components/shared/AppCircularProgress/interfaces';

export const Container = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{ $background?: Background }>(({ theme, $background }) => ({
  display: 'inline-flex',
  width: 'auto',
  padding: theme.spacing(0.75, 1),
  backgroundColor:
    $background === 'blue'
      ? theme.palette.entityType.DATA_CONSUMER
      : 'transparent',
  borderRadius: theme.spacing(2),
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  alignItems: 'center',
}));

export const TextContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'center',
  marginLeft: theme.spacing(1.25),
  whiteSpace: 'nowrap',
}));

export const SpinnerContainer = styled(Grid)(({ theme }) => ({
  position: 'relative',
  alignItems: 'center',
}));

export const ProgressBack = styled(CircularProgress, {
  shouldForwardProp: propsChecker,
})<{ $progressBackground?: ProgressBackground }>(
  ({ theme, $progressBackground }) => ({
    color:
      $progressBackground === 'light'
        ? theme.palette.backgrounds.default
        : theme.palette.backgrounds.secondary,
  })
);

export const Progress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.button.primaryLight.normal.color,
  position: 'absolute',
  left: 0,
}));
