import React from 'react';
import { PaperProps } from '@mui/material';
import * as S from './AppPaperStyles';

const AppPaper: React.FC<PaperProps> = ({ children, sx, ...props }) => {
  return (
    <S.AppPapper sx={sx} {...props}>
      {children}
    </S.AppPapper>
  );
};
export default AppPaper;
