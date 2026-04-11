import React, { type FC, type PropsWithChildren } from 'react';
import * as S from './ListLayout.styles';

const ListLayout: FC<PropsWithChildren> = ({ children }) => (
  <S.Container>{children}</S.Container>
);

export default ListLayout;
