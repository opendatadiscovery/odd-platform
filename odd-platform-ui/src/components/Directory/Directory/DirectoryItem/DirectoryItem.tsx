import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { DataSourceType } from 'generated-sources';
import { DatasourceLogo } from 'components/shared/elements';
import { pluralize } from 'lib/helpers';
import * as S from './DirectoryItem.styles';

interface DirectoryItemProps {
  name: DataSourceType['name'];
  prefix: DataSourceType['prefix'];
  entitiesCount: DataSourceType['entitiesCount'];
}

const DirectoryItem: FC<DirectoryItemProps> = ({ name, prefix, entitiesCount }) => (
  <Link to={prefix}>
    <S.Container>
      <S.LogoContainer>
        <DatasourceLogo name={prefix} backgroundColor='transparent' />
      </S.LogoContainer>
      <S.TextContainer>
        <Typography variant='h4'>{name}</Typography>
        <Typography variant='subtitle2'>
          {pluralize(entitiesCount, 'entity', 'entities')}
        </Typography>
      </S.TextContainer>
    </S.Container>
  </Link>
);

export default DirectoryItem;
