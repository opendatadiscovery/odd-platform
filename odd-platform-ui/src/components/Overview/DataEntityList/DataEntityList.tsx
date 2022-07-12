import { Grid, Typography } from '@mui/material';
import React from 'react';
import { DataEntityRef } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { dataEntityDetailsPath } from 'lib/paths';
import * as S from './DataEntityListStyles';

interface OverviewDataEntityProps {
  dataEntitiesList: DataEntityRef[];
  entityListName: string;
  entityListIcon?: JSX.Element;
  isFetching: boolean;
}

const DataEntityList: React.FC<OverviewDataEntityProps> = ({
  dataEntitiesList,
  entityListName,
  entityListIcon,
  isFetching,
}) => (
  <Grid item>
    <S.DataEntityListContainer>
      <S.SectionCaption variant="h4" sx={{ mb: 2 }}>
        {entityListIcon}
        {entityListName}
      </S.SectionCaption>
      <S.ListLinksContainer>
        {dataEntitiesList.map(item => (
          <li key={item.id}>
            <Grid container alignItems="center" wrap="nowrap">
              <S.ListLink to={dataEntityDetailsPath(item.id)}>
                {item.hasAlerts ? <AlertIcon sx={{ mr: 0.5 }} /> : null}
                <Typography
                  noWrap
                  title={item.internalName || item.externalName}
                >
                  {item.internalName || item.externalName}
                </Typography>
              </S.ListLink>
              {item.entityClasses?.map(entityClass => (
                <EntityClassItem
                  sx={{ ml: 0.5 }}
                  key={entityClass.id}
                  entityClassName={entityClass.name}
                />
              ))}
            </Grid>
          </li>
        ))}
        {!isFetching && !dataEntitiesList.length ? (
          <EmptyContentPlaceholder />
        ) : null}
      </S.ListLinksContainer>
    </S.DataEntityListContainer>
  </Grid>
);

export default DataEntityList;
