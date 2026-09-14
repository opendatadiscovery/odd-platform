import React, { type FC, useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDataEntityDetails } from 'lib/hooks';
import MetadataItem from '../MetadataItem/MetadataItem';
import Markdown from '../Markdown/Markdown';
import * as S from './AssetDetailsPreview.styles';
import {
  EmptyLine,
  FailureBody,
  LoadingBody,
  ready,
  SectionHeader,
  TagsBlock,
} from './PreviewCard';

/**
 * The Data Entity card of the (i) details preview: Tags / Custom metadata / Predefined metadata / About, read from
 * `GET /api/dataentities/{id}` when the card opens (the body mounts inside the tooltip, so the read fires on open,
 * never on the page render). The content is what the DE-only preview rendered before #1899 made the badge
 * polymorphic; the terminal states (spinner / "Couldn't load details") are the shared card's.
 */
const DataEntityPreview: FC<{ id: number }> = ({ id }) => {
  const { t } = useTranslation();
  const { isLoading, data: dataEntityDetails } = useDataEntityDetails({
    dataEntityId: id,
  });

  const metadataNum = 5;

  const customMetadata = useMemo(
    () =>
      dataEntityDetails?.metadataFieldValues?.filter(
        ({ field }) => field.origin === 'INTERNAL'
      ) ?? [],
    [dataEntityDetails?.metadataFieldValues]
  );

  const predefinedMetadata = useMemo(
    () =>
      dataEntityDetails?.metadataFieldValues?.filter(
        ({ field }) => field.origin === 'EXTERNAL'
      ) ?? [],
    [dataEntityDetails?.metadataFieldValues]
  );

  if (isLoading) return <LoadingBody />;
  if (!ready(dataEntityDetails)) return <FailureBody />;

  return (
    <>
      <Grid container>
        <S.BlockContainer>
          <SectionHeader
            title={t('Tags')}
            count={dataEntityDetails.tags?.length ?? 0}
            unit={t('tags')}
          />
          <TagsBlock tags={dataEntityDetails.tags} />
        </S.BlockContainer>
        <S.BlockContainer>
          <SectionHeader
            title={t('Custom metadata')}
            count={customMetadata.length}
            unit={t('fields')}
          />
          {customMetadata.length ? (
            customMetadata
              .slice(0, metadataNum)
              .map(metadata => (
                <MetadataItem
                  key={metadata.field.id}
                  metadata={metadata}
                  labelWidth={5}
                />
              ))
          ) : (
            <EmptyLine>{t('No custom metadata')}</EmptyLine>
          )}
        </S.BlockContainer>
      </Grid>
      <Grid container>
        <SectionHeader
          title={t('Predefined metadata')}
          count={predefinedMetadata.length}
          unit={t('fields')}
        />
        {predefinedMetadata.length ? (
          predefinedMetadata
            .slice(0, metadataNum)
            .map(metadata => (
              <MetadataItem key={metadata.field.id} metadata={metadata} labelWidth={5} />
            ))
        ) : (
          <EmptyLine>{t('No predefined metadata')}</EmptyLine>
        )}
      </Grid>
      <S.AboutContainer container sx={{ mt: 2 }} data-color-mode='light'>
        <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
          <Typography variant='h4' color='text.primary'>
            {t('About')}
          </Typography>
        </Grid>
        <S.AboutText variant='body1' color='texts.secondary'>
          {dataEntityDetails.internalDescription ? (
            // Route through the shared <Markdown> wrapper so internalDescription is
            // rehype-sanitized like every other render sink (GHSA-mf43-2636-9289), instead
            // of the previous direct <MDEditor.Markdown> which bypassed sanitization.
            <Markdown value={dataEntityDetails.internalDescription} />
          ) : (
            t('Not created')
          )}
        </S.AboutText>
      </S.AboutContainer>
    </>
  );
};

export default DataEntityPreview;
