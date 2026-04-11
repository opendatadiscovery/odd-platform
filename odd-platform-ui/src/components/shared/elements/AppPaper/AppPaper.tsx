import React from 'react';
import { type PaperProps } from '@mui/material';
import * as S from 'components/shared/elements/AppPaper/AppPaperStyles';

const AppPaper: React.FC<PaperProps> = React.forwardRef(
  ({ children, sx, ...props }, ref) => (
    <S.AppPapper ref={ref} sx={sx} {...props}>
      {children}
    </S.AppPapper>
  )
);
export default AppPaper;
