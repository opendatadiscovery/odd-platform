import React, { type FC } from 'react';
import ChevronIcon from 'components/shared/icons/ChevronIcon';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import * as S from './BreadCrumbs.styles';

interface BreadCrumbsProps {
  pathNames: Array<string | number>;
  labelsMap: Record<string, string | undefined>;
}

const BreadCrumbs: FC<BreadCrumbsProps> = ({ pathNames, labelsMap }) => (
  <S.Container aria-label='breadcrumb'>
    {pathNames.map((value, idx) => {
      const isLast = idx === pathNames.length - 1;
      const to = `/${pathNames.slice(0, idx + 1).join('/')}`;

      const label = labelsMap[value];

      return (
        <React.Fragment key={to}>
          {idx !== 0 && <ChevronIcon sx={{ transform: 'rotate(-90deg)', mx: 1 }} />}
          {isLast ? (
            <Typography variant='body2'>{label}</Typography>
          ) : (
            <Link to={to}>
              <S.Active variant='subtitle2'>{label}</S.Active>
            </Link>
          )}
        </React.Fragment>
      );
    })}
  </S.Container>
);

export default BreadCrumbs;
