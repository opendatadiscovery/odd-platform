import { Link as MuiLink, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type DataEntityRef } from 'generated-sources';
import {
  EntityClassItem,
  EmptyContentPlaceholder,
  MetadataStale,
} from 'components/shared/elements';
import { AlertIcon } from 'components/shared/icons';
import { dataEntityDetailsPath } from 'routes';
import * as S from './DataEntityListStyles';

interface OverviewDataEntityProps {
  dataEntitiesList: DataEntityRef[];
  entityListName: string;
  entityListIcon?: JSX.Element;
  isFetching: boolean;
  isNotFetched: boolean;
  /**
   * ST-8 (#1842 / ADR D8) — where this panel's "View all" goes. The panels are quick-jump widgets whose full
   * list is a pre-filtered search, so the link is the canonical param URL for the matching My-data scope.
   * Omitted = no link (the panel is informational only), which is how every panel behaved before ST-8.
   */
  viewAllTo?: string;
}

const DataEntityList: React.FC<OverviewDataEntityProps> = ({
  dataEntitiesList,
  entityListName,
  entityListIcon,
  isFetching,
  isNotFetched,
  viewAllTo,
}) => {
  const { t } = useTranslation();

  return isNotFetched ? null : (
    <S.DataEntityListContainer item lg={3}>
      <S.SectionCaption variant='h4' sx={{ mb: 2 }}>
        {entityListIcon}
        {entityListName}
      </S.SectionCaption>

      <S.ListLinksContainer $isListEmpty={!dataEntitiesList.length}>
        {dataEntitiesList.map(item => (
          <li key={item.id}>
            <S.ListLink to={dataEntityDetailsPath(item.id)} $hasAlerts={item.hasAlerts}>
              <S.ListLinkInnerItem $bounded>
                {item.hasAlerts ? <AlertIcon sx={{ mr: 0.5 }} /> : null}
                <MetadataStale isStale={item.isStale} />

                <Typography
                  noWrap
                  ml={0.5}
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
          <EmptyContentPlaceholder fullPage={false} />
        ) : null}
      </S.ListLinksContainer>
      {viewAllTo && dataEntitiesList.length > 0 && (
        <MuiLink component={Link} to={viewAllTo} variant='subtitle2' sx={{ mt: 1 }}>
          {t('View all')}
        </MuiLink>
      )}
    </S.DataEntityListContainer>
  );
};

export default DataEntityList;
