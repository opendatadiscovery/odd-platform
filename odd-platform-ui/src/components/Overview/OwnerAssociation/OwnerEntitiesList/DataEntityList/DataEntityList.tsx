import { Typography, Box } from '@mui/material';
import React from 'react';
import { DataEntityRef } from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { useAppPaths } from 'lib/hooks';
import * as S from 'components/Overview/OwnerAssociation/OwnerEntitiesList/DataEntityList/DataEntityListStyles';

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
}) => {
  const { dataEntityDetailsPath } = useAppPaths();

  return (
    <S.DataEntityListContainer item>
      <S.SectionCaption variant="h4" sx={{ mb: 2 }}>
        {entityListIcon}
        {entityListName}
      </S.SectionCaption>

      <S.ListLinksContainer>
        {dataEntitiesList.map(item => (
          <li key={item.id}>
            <S.ListLink
              to={dataEntityDetailsPath(item.id)}
              $hasAlerts={item.hasAlerts}
            >
              <S.ListLinkInnerItem $bounded>
                {item.hasAlerts ? <AlertIcon sx={{ mr: 0.5 }} /> : null}

                <Typography
                  noWrap
                  title={item.internalName || item.externalName}
                >
                  {item.internalName || item.externalName}
                </Typography>
              </S.ListLinkInnerItem>

              <S.ListLinkInnerItem>
                {item.entityClasses?.map(entityClass => (
                  <EntityClassItem
                    sx={{ ml: 0.5 }}
                    key={entityClass.id}
                    entityClassName={entityClass.name}
                  />
                ))}
              </S.ListLinkInnerItem>
            </S.ListLink>
          </li>
        ))}

        {!isFetching && !dataEntitiesList.length ? (
          <EmptyContentPlaceholder />
        ) : null}
      </S.ListLinksContainer>
    </S.DataEntityListContainer>
  );
};

export default DataEntityList;
