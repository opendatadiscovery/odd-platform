import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTermDetails } from 'lib/hooks';
import LabelItem from '../LabelItem/LabelItem';
import Markdown from '../Markdown/Markdown';
import * as S from './AssetDetailsPreview.styles';
import {
  ClampedBlock,
  EmptyLine,
  FailureBody,
  LoadingBody,
  ready,
  Row,
  SectionHeader,
  TagsBlock,
} from './PreviewCard';

/** The bounds of the card's long-text blocks (px) — the numbers behind the card's height budget (#1899). */
export const DEFINITION_MAX_HEIGHT = 120;

/**
 * The Term card of the (i) details preview (#1899), read from `GET /api/terms/{id}` when the card opens: the
 * definition in full (as the term page renders it — markdown; bounded, with a visible cut), the namespace, the
 * owners (name + title, as the term page's rail), the tags, and how much is linked to the term under the term
 * page's own tab labels (Linked entities / columns / terms, Query examples). Sections in the term page's order.
 */
const TermPreview: FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const { isLoading, data: term } = useTermDetails({ termId: id });

  if (isLoading) return <LoadingBody />;
  if (!ready(term)) return <FailureBody />;

  const owners = term.ownership ?? [];
  const counts: Array<[string, number]> = [
    [t('Linked entities'), term.entitiesUsingCount ?? 0],
    [t('Linked columns'), term.columnsUsingCount ?? 0],
    [t('Linked terms'), term.linkedTermsUsingCount ?? 0],
    [t('Query examples'), term.queryExampleUsingCount ?? 0],
  ];

  return (
    <>
      <S.BlockContainer data-color-mode='light'>
        <SectionHeader title={t('Definition')} />
        <ClampedBlock maxHeight={DEFINITION_MAX_HEIGHT} clamp='definition'>
          <Markdown value={term.definition} disableCopy />
        </ClampedBlock>
      </S.BlockContainer>
      <S.BlockContainer>
        <Row label={t('Namespace')}>{term.namespace?.name}</Row>
      </S.BlockContainer>
      <S.BlockContainer>
        <SectionHeader title={t('Owners')} />
        {owners.length ? (
          owners.map(ownership => (
            <S.OwnerRow key={ownership.id} data-testid='asset-details-preview-owner'>
              <Typography variant='body1'>{ownership.owner.name}</Typography>
              {ownership.title?.name && (
                <LabelItem sx={{ ml: 0.5 }} labelName={ownership.title.name} />
              )}
            </S.OwnerRow>
          ))
        ) : (
          <EmptyLine>{t('No owners')}</EmptyLine>
        )}
      </S.BlockContainer>
      <S.BlockContainer>
        <SectionHeader
          title={t('Tags')}
          count={term.tags?.length ?? 0}
          unit={t('tags')}
        />
        <TagsBlock tags={term.tags} />
      </S.BlockContainer>
      <Grid container data-testid='asset-details-preview-counts'>
        {counts.map(([label, value]) => (
          <Row key={label} label={label}>
            {value}
          </Row>
        ))}
      </Grid>
    </>
  );
};

export default TermPreview;
