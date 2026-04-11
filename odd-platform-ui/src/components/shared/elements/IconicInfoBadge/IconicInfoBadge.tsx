import React, { type FC, type ReactElement } from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import * as S from './IconicInfoBadge.styles';

interface IconicInfoBadgeProps {
  to: string;
  name: string;
  count: number;
  icon: ReactElement;
}

const IconicInfoBadge: FC<IconicInfoBadgeProps> = ({ to, icon, name, count }) => (
  <Link to={to}>
    <S.Container>
      <S.NameContainer>
        {icon}
        <Typography ml={1} variant='h4'>
          {name}
        </Typography>
      </S.NameContainer>
      <Typography variant='subtitle2'>{count}</Typography>
    </S.Container>
  </Link>
);

export default IconicInfoBadge;
