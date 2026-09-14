import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AssetKind, type DataEntity, type LinkedTerm } from 'generated-sources';
import { useGetQueryExampleDetails } from 'lib/hooks/api/dataModelling/queryExamples';
import { favoriteAssetName } from 'components/Favorites/lib';
import Markdown from '../Markdown/Markdown';
import * as S from './AssetDetailsPreview.styles';
import {
  ClampedBlock,
  EmptyLine,
  FailureBody,
  LoadingBody,
  MoreLine,
  ready,
  SectionHeader,
} from './PreviewCard';
import { DEFINITION_MAX_HEIGHT } from './TermPreview';

/** The bound of the Query block (px) and the cap of each linked list — the card's height budget (#1899). */
export const QUERY_MAX_HEIGHT = 200;
export const LINKED_CAP = 5;

/** The display name of a linked data entity — the row's own rule (`internalName ‖ externalName`). */
const entityName = (entity: DataEntity) =>
  favoriteAssetName({ assetKind: AssetKind.DATA_ENTITY, dataEntity: entity });

/**
 * The Query Example card of the (i) details preview (#1899), read from `GET /api/queryexample/{id}` when the card
 * opens: the definition, what the example is linked to (entities with their datasource, terms — the first five of
 * each and a "+N more"), and — last, because it is the one block that can be long — the query, rendered exactly as
 * the query-example page renders it (markdown: a fenced block shows as code, an unfenced paste as it does on the
 * page), bounded with a visible cut.
 */
const QueryExamplePreview: FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const { isLoading, data: example } = useGetQueryExampleDetails({ exampleId: id });

  if (isLoading) return <LoadingBody />;
  if (!ready(example)) return <FailureBody />;

  const entities = example.linkedEntities?.items ?? [];
  const entitiesTotal = example.linkedEntities?.pageInfo?.total ?? entities.length;
  const terms: LinkedTerm[] = example.linkedTerms?.items ?? [];

  return (
    <>
      <S.BlockContainer data-color-mode='light'>
        <SectionHeader title={t('Definition')} />
        <ClampedBlock maxHeight={DEFINITION_MAX_HEIGHT} clamp='definition'>
          <Markdown value={example.definition} disableCopy />
        </ClampedBlock>
      </S.BlockContainer>
      <S.BlockContainer data-testid='asset-details-preview-linked-entities'>
        <SectionHeader title={t('Linked entities')} count={entitiesTotal} />
        {entities.length ? (
          <>
            {entities.slice(0, LINKED_CAP).map(entity => (
              <Typography key={entity.id} variant='body1' component='div' noWrap>
                {entityName(entity)}
                {entity.dataSource?.name && <S.Muted>· {entity.dataSource.name}</S.Muted>}
              </Typography>
            ))}
            <MoreLine count={entitiesTotal - LINKED_CAP} />
          </>
        ) : (
          <EmptyLine>{t('No linked entities')}</EmptyLine>
        )}
      </S.BlockContainer>
      <S.BlockContainer data-testid='asset-details-preview-linked-terms'>
        <SectionHeader title={t('Linked terms')} count={terms.length} />
        {terms.length ? (
          <>
            {terms.slice(0, LINKED_CAP).map(({ term }) => (
              <Typography key={term.id} variant='body1' component='div' noWrap>
                {term.name}
              </Typography>
            ))}
            <MoreLine count={terms.length - LINKED_CAP} />
          </>
        ) : (
          <EmptyLine>{t('No linked terms')}</EmptyLine>
        )}
      </S.BlockContainer>
      <div data-color-mode='light' data-testid='asset-details-preview-query'>
        <SectionHeader title={t('Query')} />
        <ClampedBlock maxHeight={QUERY_MAX_HEIGHT} clamp='query'>
          <Markdown value={example.query} disableCopy />
        </ClampedBlock>
      </div>
    </>
  );
};

export default QueryExamplePreview;
