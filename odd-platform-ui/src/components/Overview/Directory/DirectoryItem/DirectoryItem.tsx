import React, { type FC } from 'react';
import type { DataSourceType } from 'generated-sources';
import { DatasourceLogo } from 'components/shared/elements';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import * as S from './DirectoryItem.styles';

interface DirectoryItemProps {
  name: DataSourceType['name'];
  prefix: DataSourceType['prefix'];
  entitiesCount: DataSourceType['entitiesCount'];
}

const DirectoryItem: FC<DirectoryItemProps> = ({ name, entitiesCount, prefix }) => {
  const { directoryDataSourceListPath } = useAppPaths();

  return (
    <Link to={directoryDataSourceListPath(prefix)}>
      <S.Container>
        <S.NameContainer>
          <DatasourceLogo
            name={prefix}
            width={24}
            padding={0.5}
            backgroundColor='default'
          />
          <Typography ml={1} variant='h4'>
            {name}
          </Typography>
        </S.NameContainer>
        <Typography variant='subtitle2'>{entitiesCount}</Typography>
      </S.Container>
    </Link>
  );
};

export default DirectoryItem;
