import React, { type FC } from 'react';
import type { DataEntityDomain } from 'generated-sources';
import { Typography } from '@mui/material';
import { useAppPaths } from 'lib/hooks';
import { Link } from 'react-router-dom';
import * as S from './DomainItem.styles';

interface DomainItemProps {
  domain: DataEntityDomain['domain'];
  childrenCount: DataEntityDomain['childrenCount'];
}

const DomainItem: FC<DomainItemProps> = ({ domain, childrenCount }) => {
  const { dataEntityOverviewPath } = useAppPaths();

  return (
    <Link to={dataEntityOverviewPath(domain.id)}>
      <S.Container>
        <S.CountContainer>
          <Typography variant='subtitle1'>{childrenCount}</Typography>
        </S.CountContainer>
        <Typography variant='body1' mt={1}>
          {domain.internalName ?? domain.externalName}
        </Typography>
      </S.Container>
    </Link>
  );
};

export default DomainItem;
