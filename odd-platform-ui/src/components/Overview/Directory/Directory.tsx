import React, { type FC } from 'react';
import { useGetDataSourceTypes } from 'lib/hooks';
import { Typography } from '@mui/material';
import * as S from '../shared/ItemsList.styles';
import DirectoryItem from './DirectoryItem/DirectoryItem';

const Directory: FC = () => {
  const { data: datasourceTypes } = useGetDataSourceTypes();

  return datasourceTypes && datasourceTypes?.length > 0 ? (
    <S.Container>
      <Typography variant='h1'>Directory</Typography>
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
