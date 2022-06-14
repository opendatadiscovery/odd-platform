import React from 'react';
import { Typography, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import {
  Background,
  ProgressBackground,
} from 'components/shared/AppCircularProgress/interfaces';
import * as S from './AppCircularProgressStyles';

export interface AppCircularProgressProps {
  text?: string;
  size: number;
  sx?: SxProps<Theme>;
  background?: Background;
  progressBackground?: ProgressBackground;
}

const AppCircularProgress: React.FC<AppCircularProgressProps> = ({
  text,
  size,
  sx,
  background = 'blue',
  progressBackground = 'light',
}) => (
  <S.Container
    $background={background}
    sx={sx}
    container
    aria-label="AppCircularProgress"
  >
    <S.SpinnerContainer container>
      <S.ProgressBack
        $progressBackground={progressBackground}
        size={size}
        variant="determinate"
        value={100}
        aria-label="AppCircularProgressBack"
      />
      <S.Progress size={size} />
    </S.SpinnerContainer>

    {text && (
      <S.TextContainer item container xs={10}>
        <Typography variant="body2" color="textSecondary">
          {text}
        </Typography>
      </S.TextContainer>
    )}
  </S.Container>
);

export default AppCircularProgress;
