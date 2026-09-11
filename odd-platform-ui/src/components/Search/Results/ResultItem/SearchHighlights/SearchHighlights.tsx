import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getAssetSearchHighlight,
  getAssetSearchHighlightFetchingStatuses,
} from 'redux/selectors';
import { fetchAssetSearchHighlight } from 'redux/thunks';
import {
  AppCircularProgress,
  LabeledInfoItem,
  LabelItem,
  TagItem,
} from 'components/shared/elements';
import type { SearchHighlightsTitlesKey } from 'lib/constants';
import { searchHighlightsTitlesMap } from 'lib/constants';
import { getMetadataValue } from 'lib/helpers';
import {
  AssetKind,
  type Asset,
  type AssetSearchHighlight,
  type DataEntityHighlight,
  type DataEntitySearchHighlight,
  type DataSetStructureHighlight,
  type MetadataFieldValue,
  type OwnershipHighlight,
  type QueryExampleSearchHighlight,
  type Tag,
  type TermSearchHighlight,
} from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { favoriteAssetId as assetItemId } from 'components/Favorites/lib';
import HighlightedText from './HighlightedText';
import * as S from './SearchHighlightsStyles';

interface SearchHighlightsProps {
  asset: Asset;
  /** the query the page was searched with — the same string POST /api/search/assets received */
  query: string;
}

/**
 * ST-12 (#1846) — the body of a result row's (?) "why it matched" tooltip, for EVERY kind. Mounts when the
 * tooltip opens (hover / focus) and fetches that one row's highlight from the stateless
 * `GET /api/search/assets/{kind}/{id}/highlights?query=` — nothing runs on the page request. Renders, per kind,
 * exactly the fields the kind is indexed on: a Data Entity's seven sections as before; a Term's name /
 * definition, namespace, tags and owners; a Query Example's definition, query text and linked entities. Every
 * string is rendered through `HighlightedText` — a split on the server's marks, never an HTML parser. Three
 * terminal states, none of them an empty popper: loading, "Couldn't load match details" (the fetch rejected),
 * "No field matches to show" (the query hit a part of the asset the highlight document does not carry, or
 * beyond its 16 KB field bound).
 */
const SearchHighlights: React.FC<SearchHighlightsProps> = ({ asset, query }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { metadataFormattedDateTime } = useAppDateTime();
  const highlightedStringMaxWidth = 450;

  const assetId = assetItemId(asset);
  const highlight = useAppSelector(getAssetSearchHighlight(asset.assetKind, assetId));
  // The loader statuses are per ACTION, not per row: a row's own request is known to have been issued only
  // after this component's effect ran, so the first render (before the dispatch) shows the spinner rather
  // than a sentence left over from another row's fetch.
  const { isLoading, isNotLoaded } = useAppSelector(
    getAssetSearchHighlightFetchingStatuses
  );
  const requested = React.useRef(false);

  React.useEffect(() => {
    requested.current = true;
    dispatch(fetchAssetSearchHighlight({ assetKind: asset.assetKind, assetId, query }));
  }, [asset.assetKind, assetId, query, dispatch]);

  const getTitle = (key: SearchHighlightsTitlesKey) =>
    t(searchHighlightsTitlesMap.get(key)!);

  const text = (value: string) => <HighlightedText text={value} />;
  const windowed = (value: string) => (
    <HighlightedText text={value} maxWidth={highlightedStringMaxWidth} />
  );

  // ---- the shared section renderers (a section renders only when its part of the highlight is present) ----

  const singleSection = (
    title: SearchHighlightsTitlesKey,
    fields: Record<string, string | undefined> | undefined
  ) => {
    const entries = Object.entries(fields ?? {}).filter(([, val]) => !!val);
    if (entries.length === 0) return null;
    return (
      <Grid container flexDirection='column' key={title}>
        <Typography variant='h4'>{getTitle(title)}</Typography>
        {entries.map(([key, val]) => (
          <LabeledInfoItem
            key={key}
            sx={{ mt: 0.25 }}
            inline
            label={getTitle(key as SearchHighlightsTitlesKey)}
            labelWidth={3}
          >
            {windowed(val as string)}
          </LabeledInfoItem>
        ))}
      </Grid>
    );
  };

  const tagsSection = (tags: Tag[] | undefined) =>
    tags && tags.length > 0 ? (
      <Grid container flexDirection='column'>
        <Typography variant='h4'>{getTitle('tags')}</Typography>
        <Grid container mt={0.5} flexDirection='row'>
          {tags.map(tag => (
            <TagItem
              key={tag.id}
              sx={{ mr: 0.5 }}
              label={text(tag.name)}
              important={tag.important}
              systemTag={tag.external}
            />
          ))}
        </Grid>
      </Grid>
    ) : null;

  const ownersSection = (owners: OwnershipHighlight[] | undefined) =>
    owners && owners.length > 0 ? (
      <Grid container flexDirection='column'>
        <Typography variant='h4'>{getTitle('owners')}</Typography>
        <Grid container mt={0.5} flexDirection='column'>
          {owners.map(
            entity =>
              entity.owner &&
              entity.title && (
                <S.OwnerItem key={`${entity.owner}-${entity.title}`}>
                  {text(entity.owner)}
                  <LabelItem sx={{ ml: 0.5 }} labelName={text(entity.title)} />
                </S.OwnerItem>
              )
          )}
        </Grid>
      </Grid>
    ) : null;

  const metadataSection = (metadata: MetadataFieldValue[] | undefined) =>
    metadata && metadata.length > 0 ? (
      <Grid container flexDirection='column'>
        <Typography variant='h4'>{getTitle('metadata')}</Typography>
        <Grid container mt={0.5} flexDirection='column'>
          {metadata.map(entity => (
            <LabeledInfoItem
              key={entity.field.id}
              sx={{ mt: 0.25 }}
              inline
              label={text(entity.field.name)}
              labelWidth={3}
            >
              {windowed(
                getMetadataValue(entity.field, entity.value, metadataFormattedDateTime)
              )}
            </LabeledInfoItem>
          ))}
        </Grid>
      </Grid>
    ) : null;

  const structureSection = (structure: DataSetStructureHighlight[] | undefined) =>
    structure && structure.length > 0 ? (
      <Grid container flexDirection='column'>
        <Typography variant='h4'>{getTitle('datasetStructure')}</Typography>
        <Grid container mt={0.5} flexDirection='column'>
          {structure.map(entity => (
            <S.StructureItem key={entity.name} container flexDirection='column'>
              {entity.name && (
                <LabeledInfoItem inline label={t('Column name')} labelWidth={3}>
                  {windowed(entity.name)}
                </LabeledInfoItem>
              )}
              {entity.internalDescription && (
                <LabeledInfoItem inline label={t('Internal description')} labelWidth={3}>
                  {windowed(entity.internalDescription)}
                </LabeledInfoItem>
              )}
              {entity.externalDescription && (
                <LabeledInfoItem inline label={t('External description')} labelWidth={3}>
                  {windowed(entity.externalDescription)}
                </LabeledInfoItem>
              )}
              {entity.tags && entity.tags.length > 0 && (
                <LabeledInfoItem inline label={t('Tags')} labelWidth={3}>
                  <Grid container mt={0.5}>
                    {entity.tags.map(({ id, name: tagName, external }) => (
                      <LabelItem
                        key={id}
                        sx={{ ml: 0.5 }}
                        systemLabel={external}
                        labelName={text(tagName)}
                      />
                    ))}
                  </Grid>
                </LabeledInfoItem>
              )}
            </S.StructureItem>
          ))}
        </Grid>
      </Grid>
    ) : null;

  // ---- per kind ----

  const dataEntitySections = (de: DataEntitySearchHighlight) => [
    singleSection(
      'dataEntity',
      de.dataEntity as Record<string, string | undefined> | undefined
    ),
    singleSection(
      'dataSource',
      de.dataSource as Record<string, string | undefined> | undefined
    ),
    singleSection(
      'namespace',
      de.namespace as Record<string, string | undefined> | undefined
    ),
    tagsSection(de.tags),
    ownersSection(de.owners),
    metadataSection(de.metadata),
    structureSection(de.datasetStructure),
  ];

  const termSections = (term: TermSearchHighlight) => [
    singleSection('term', { name: term.name, definition: term.definition }),
    singleSection(
      'namespace',
      term.namespace as Record<string, string | undefined> | undefined
    ),
    tagsSection(term.tags),
    ownersSection(term.owners),
  ];

  const queryExampleSections = (qe: QueryExampleSearchHighlight) => {
    // a linked entity is reported by whichever of its names the query hit (the internal one first)
    const linkedRows = (qe.linkedEntities ?? []).map(
      (entity: DataEntityHighlight, index) => {
        const nameKey: SearchHighlightsTitlesKey = entity.internalName
          ? 'internalName'
          : 'externalName';
        return {
          entity,
          nameKey,
          key: `${entity.externalName ?? ''}-${entity.internalName ?? ''}-${index}`,
        };
      }
    );
    return [
      qe.definition || qe.query ? (
        <Grid container flexDirection='column' key='queryExample'>
          <Typography variant='h4'>{getTitle('queryExample')}</Typography>
          {qe.definition && (
            <LabeledInfoItem
              sx={{ mt: 0.25 }}
              inline
              label={getTitle('definition')}
              labelWidth={3}
            >
              {windowed(qe.definition)}
            </LabeledInfoItem>
          )}
          {qe.query && (
            <LabeledInfoItem
              sx={{ mt: 0.25 }}
              inline
              label={getTitle('query')}
              labelWidth={3}
            >
              <HighlightedText text={qe.query} maxWidth={highlightedStringMaxWidth} pre />
            </LabeledInfoItem>
          )}
        </Grid>
      ) : null,
      linkedRows.length > 0 ? (
        <Grid container flexDirection='column' key='linkedEntities'>
          <Typography variant='h4'>{getTitle('linkedEntities')}</Typography>
          <Grid container mt={0.5} flexDirection='column'>
            {linkedRows.map(({ entity, nameKey, key }) => (
              <LabeledInfoItem
                key={key}
                sx={{ mt: 0.25 }}
                inline
                label={getTitle(nameKey)}
                labelWidth={3}
              >
                {windowed((entity.internalName ?? entity.externalName) as string)}
              </LabeledInfoItem>
            ))}
          </Grid>
        </Grid>
      ) : null,
    ];
  };

  const sectionsFor = (h: AssetSearchHighlight): React.ReactNode[] => {
    if (h.assetKind === AssetKind.TERM && h.term) return termSections(h.term);
    if (h.assetKind === AssetKind.QUERY_EXAMPLE && h.queryExample) {
      return queryExampleSections(h.queryExample);
    }
    if (h.assetKind === AssetKind.DATA_ENTITY && h.dataEntity) {
      return dataEntitySections(h.dataEntity);
    }
    return [];
  };

  // ---- the three terminal states + the content ----

  if (!highlight && (!requested.current || isLoading)) {
    return (
      <S.Container container data-testid='search-highlights'>
        <Grid container justifyContent='center'>
          <AppCircularProgress
            background='transparent'
            progressBackground='dark'
            size={50}
          />
        </Grid>
      </S.Container>
    );
  }

  if (!highlight) {
    return (
      <S.Container container data-testid='search-highlights'>
        <S.StateText variant='body1'>
          {isNotLoaded ? t("Couldn't load match details") : t('No field matches to show')}
        </S.StateText>
      </S.Container>
    );
  }

  const sections = sectionsFor(highlight).filter(Boolean);
  return (
    <S.Container container data-testid='search-highlights'>
      {sections.length > 0 ? (
        sections
      ) : (
        <S.StateText variant='body1'>{t('No field matches to show')}</S.StateText>
      )}
    </S.Container>
  );
};

export default SearchHighlights;
