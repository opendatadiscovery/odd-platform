import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetDataSourceTypes } from 'lib/hooks';
import * as S from '../shared/ItemsList.styles';
import DirectoryItem from './DirectoryItem/DirectoryItem';

const Directory: FC = () => {
  const { t } = useTranslation();
  const { data: datasourceTypes } = useGetDataSourceTypes();

  return datasourceTypes && datasourceTypes?.length > 0 ? (
    <S.Container>
      <Typography variant='h1'>{t('Directory')}</Typography>
      <S.ListContainer>
        {datasourceTypes.map(({ name, entitiesCount, prefix }) => (
          <DirectoryItem
            key={prefix}
            name={name}
            prefix={prefix}
            entitiesCount={entitiesCount}
          />
        ))}
      </S.ListContainer>
    </S.Container>
  ) : null;
};

export default Directory;
