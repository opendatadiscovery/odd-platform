import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetDomains } from 'lib/hooks';
import DomainItem from './DomainItem/DomainItem';
import * as S from '../shared/ItemsList.styles';

const Domains: FC = () => {
  const { t } = useTranslation();
  const { data: domains } = useGetDomains();

  return domains && domains?.length > 0 ? (
    <S.Container>
      <Typography variant='h1'>{t('Domains')}</Typography>
      <S.ListContainer>
        {domains.map(({ domain, childrenCount }) => (
          <DomainItem key={domain.id} domain={domain} childrenCount={childrenCount} />
        ))}
      </S.ListContainer>
    </S.Container>
  ) : null;
};

export default Domains;
