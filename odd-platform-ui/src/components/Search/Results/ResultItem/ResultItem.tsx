import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AssetKind, type Asset } from 'generated-sources';
import {
  AppTooltip,
  DataEntityDetailsPreview,
  EntityClassItem,
  EntityStatus,
  FavoriteStar,
  MetadataStale,
  RecentlyViewedTag,
} from 'components/shared/elements';
import { QuestionIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getSearchQuery } from 'redux/selectors';
// ST-4 (#1838) — REUSE the polymorphic-asset helpers the Favorites list already ships (`Asset` and
// `FavoriteAsset` are the same `{ asset_kind, data_entity?, term?, query_example? }` shape), so id / name /
// detail-link / kind-label resolution stays single-sourced instead of duplicated (Gate 1).
import {
  assetKindSingularLabel,
  favoriteAssetId as assetItemId,
  favoriteAssetLink as assetItemLink,
  favoriteAssetName as assetItemName,
} from 'components/Favorites/lib';
import { ASSET_RESULT_COLS as COL, SearchCol } from '../Results.styles';
import * as S from './ResultItemStyles';
import SearchHighlights from './SearchHighlights/SearchHighlights';

interface ResultItemProps {
  asset: Asset;
}

/**
 * ST-4 (#1838) — one polymorphic cross-kind result row. It switches on `asset.asset_kind` and routes on click
 * to that kind's detail page (Data Entity → /dataentities, Term → /terms, Query Example → the data-modelling
 * query-example page — all via the shared `favoriteAsset*` resolvers). The Data-Entity row keeps its rich
 * affordances that the `DataEntityRef` payload supports (staleness marker, the "why it matched" highlight,
 * the details preview, class chips, status); Term / Query-Example render the clean minimal row the slice calls
 * for (name / definition + the kind label; no highlight — that parity is ST-12). PLT-147 guard: a row whose
 * per-kind ref is null / absent renders empty cells and a no-op click — it never throws (no error boundary
 * exists in odd-platform-ui, so a throw here would white-screen /search).
 */
const ResultItem: React.FC<ResultItemProps> = ({ asset }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatDistanceToNowStrict } = useAppDateTime();
  const searchQuery = useAppSelector(getSearchQuery);

  const id = assetItemId(asset);
  const name = assetItemName(asset);
  const detailsLink = assetItemLink(asset);
  const hasRef = id > 0; // PLT-147: a null-details ref → no id → no star / recency / routable link

  const isDataEntity = asset.assetKind === AssetKind.DATA_ENTITY;
  const { dataEntity, term } = asset;

  // Per-kind cell projections — each renders only where its ref carries the value, empty otherwise.
  const entityClasses = isDataEntity ? dataEntity?.entityClasses : undefined;
  const status = isDataEntity ? dataEntity?.status : undefined;
  const namespace = term?.namespace?.name; // only TermRef embeds a namespace today
  const updatedAt = term?.updatedAt;
  const definition = asset.assetKind === AssetKind.TERM ? term?.definition : undefined;

  const handleOpen = React.useCallback(() => {
    if (detailsLink) navigate(detailsLink);
  }, [detailsLink, navigate]);

  return (
    <S.Container data-testid='search-result-item' container onClick={handleOpen}>
      <SearchCol
        lg={COL.nm}
        md={COL.nm}
        item
        container
        justifyContent='space-between'
        wrap='nowrap'
        $sticky
      >
        <S.NameContainer container item>
          <Box display='flex' flexWrap='nowrap' alignItems='center' overflow='hidden'>
            {isDataEntity && <MetadataStale isStale={!!dataEntity?.isStale} />}
            <Typography ml={0.5} variant='body1' noWrap title={name}>
              {name}
            </Typography>
            {definition && (
              <Typography ml={1} variant='subtitle2' noWrap title={definition}>
                {definition}
              </Typography>
            )}
          </Box>
          <Box display='flex' flexWrap='nowrap' alignItems='center' sx={{ ml: 1 }}>
            {/* The DE "why it matched" highlight (fetched via the retained DE session's searchId). ST-12
                leaves Term / Query-Example without a highlight — they degrade gracefully with no badge. */}
            {isDataEntity && dataEntity && searchQuery && (
              <AppTooltip
                checkForOverflow={false}
                title={<SearchHighlights dataEntityId={dataEntity.id} />}
              >
                <QuestionIcon sx={{ mr: 1 }} />
              </AppTooltip>
            )}
            {isDataEntity && dataEntity && (
              <DataEntityDetailsPreview dataEntityId={dataEntity.id} />
            )}
            {hasRef && <FavoriteStar assetKind={asset.assetKind} assetId={id} />}
          </Box>
        </S.NameContainer>
      </SearchCol>

      <SearchCol item lg={COL.ty} md={COL.ty} container alignItems='center' wrap='nowrap'>
        <Typography
          variant='body1'
          noWrap
          title={t(assetKindSingularLabel[asset.assetKind])}
        >
          {t(assetKindSingularLabel[asset.assetKind])}
        </Typography>
        {entityClasses?.map(entityClass => (
          <EntityClassItem
            sx={{ ml: 0.5 }}
            key={entityClass.id}
            entityClassName={entityClass.name}
          />
        ))}
      </SearchCol>

      <SearchCol item lg={COL.nd} md={COL.nd}>
        {namespace ? (
          <Typography variant='body1' noWrap title={namespace}>
            {namespace}
          </Typography>
        ) : null}
      </SearchCol>

      <SearchCol item lg={COL.st} md={COL.st}>
        {status ? <EntityStatus entityStatus={status} /> : null}
      </SearchCol>

      <SearchCol item lg={COL.up} md={COL.up}>
        {updatedAt ? (
          <Typography
            variant='body1'
            noWrap
            title={formatDistanceToNowStrict(updatedAt, { addSuffix: true })}
          >
            {formatDistanceToNowStrict(updatedAt, { addSuffix: true })}
          </Typography>
        ) : null}
      </SearchCol>

      <SearchCol item lg={COL.rv} md={COL.rv} $stickyRight>
        {hasRef && <RecentlyViewedTag assetKind={asset.assetKind} assetId={id} />}
      </SearchCol>
    </S.Container>
  );
};

export default ResultItem;
