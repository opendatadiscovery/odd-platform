import React from 'react';
import { PaperProps } from '@mui/material';
import * as S from './AppPaperStyles';

const AppPaper: React.FC<PaperProps> = ({ children, sx, ...props }) => (
  <S.AppPapper sx={sx} {...props} data-testid="AppPaper">
    {children}
  </S.AppPapper>
);
export default AppPaper;
