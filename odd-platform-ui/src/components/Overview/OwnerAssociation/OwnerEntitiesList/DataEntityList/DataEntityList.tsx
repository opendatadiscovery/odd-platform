import { Typography } from '@mui/material';
import React from 'react';
import { type DataEntityRef } from 'generated-sources';
import { EntityClassItem, EmptyContentPlaceholder } from 'components/shared/elements';
import { AlertIcon } from 'components/shared/icons';
import { useAppPaths } from 'lib/hooks';
import * as S from './DataEntityListStyles';

interface OverviewDataEntityProps {
  dataEntitiesList: DataEntityRef[];
  entityListName: string;
  entityListIcon?: JSX.Element;
  isFetching: boolean;
  isNotFetched: boolean;
}

const DataEntityList: React.FC<OverviewDataEntityProps> = ({
  dataEntitiesList,
  entityListName,
  entityListIcon,
  isFetching,
  isNotFetched,
}) => {
  const { dataEntityOverviewPath } = useAppPaths();

  return isNotFetched ? null : (
    <S.DataEntityListContainer item lg={3}>
      <S.SectionCaption variant='h4' sx={{ mb: 2 }}>
        {entityListIcon}
        {entityListName}
      </S.SectionCaption>

      <S.ListLinksContainer>
        {dataEntitiesList.map(item => (
          <li key={item.id}>
            <S.ListLink to={dataEntityOverviewPath(item.id)} $hasAlerts={item.hasAlerts}>
              <S.ListLinkInnerItem $bounded>
                {item.hasAlerts ? <AlertIcon sx={{ mr: 0.5 }} /> : null}

                <Typography noWrap title={item.internalName || item.externalName}>
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
          <EmptyContentPlaceholder fullPage={false} />
        ) : null}
      </S.ListLinksContainer>
    </S.DataEntityListContainer>
  );
};

export default DataEntityList;
