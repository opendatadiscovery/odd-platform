import React from 'react';
import { type Theme, Typography } from '@mui/material';
import { type SxProps } from '@mui/system';
import type {
  Background,
  ProgressBackground,
} from 'components/shared/elements/AppCircularProgress/interfaces';
import * as S from 'components/shared/elements/AppCircularProgress/AppCircularProgressStyles';

interface AppCircularProgressProps {
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
  <S.Container $background={background} sx={sx} container>
    <S.SpinnerContainer container>
      <S.ProgressBack
        $progressBackground={progressBackground}
        size={size}
        variant='determinate'
        value={100}
      />
      <S.Progress size={size} />
    </S.SpinnerContainer>
    {text && (
      <S.TextContainer item container xs={10}>
        <Typography variant='body2' color='textSecondary'>
          {text}
        </Typography>
      </S.TextContainer>
    )}
  </S.Container>
);

export default AppCircularProgress;
