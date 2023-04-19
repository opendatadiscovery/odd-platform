import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntitySearchHighlights,
  getDataEntitySearchHighlightsFetchingStatuses,
  getSearchId,
} from 'redux/selectors';
import { fetchDataEntitySearchHighlights } from 'redux/thunks';
import { Grid, Typography } from '@mui/material';
import parse from 'html-react-parser';
import {
  AppCircularProgress,
  LabeledInfoItem,
  LabelItem,
  TagItem,
} from 'components/shared/elements';
import type { SearchHighlightsTitlesKey } from 'lib/constants';
import { searchHighlightsTitlesMap } from 'lib/constants';
import { getMetadataValue, sliceStringByWidth } from 'lib/helpers';
import type {
  DataEntitySearchHighlight,
  DataSetStructureHighlight,
  MetadataFieldValue,
  OwnershipHighlight,
  Tag,
} from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import * as S from './SearchHighlightsStyles';

interface SearchHighlightsProps {
  dataEntityId: number;
}

type SingleHighlightTypes = keyof Pick<
  DataEntitySearchHighlight,
  'dataEntity' | 'dataSource' | 'namespace'
>;
type MultipleHighlightTypes = keyof Pick<
  DataEntitySearchHighlight,
  'tags' | 'metadata' | 'datasetStructure' | 'owners'
>;

const SearchHighlights: React.FC<SearchHighlightsProps> = ({ dataEntityId }) => {
  const dispatch = useAppDispatch();
  const { metadataFormattedDateTime } = useAppDateTime();
  const highlightedStringMaxWidth = 450;

  const highlights = useAppSelector(getDataEntitySearchHighlights(dataEntityId));
  const searchId = useAppSelector(getSearchId);
  const { isLoading: isHighlightsFetching } = useAppSelector(
    getDataEntitySearchHighlightsFetchingStatuses
  );

  React.useEffect(() => {
    dispatch(fetchDataEntitySearchHighlights({ dataEntityId, searchId }));
  }, []);

  if (isHighlightsFetching)
    return (
      <S.Container container>
        <Grid container justifyContent='center'>
          <AppCircularProgress
            background='transparent'
            progressBackground='dark'
            size={50}
          />
        </Grid>
      </S.Container>
    );

  const highlightText = (value: string) => (
    <S.HighlightText variant='body1'>{parse(value)}</S.HighlightText>
  );

  const sliceAndHighlightText = (value: string) => (
    <S.HighlightText variant='body1'>
      {parse(sliceStringByWidth(value, highlightedStringMaxWidth))}
    </S.HighlightText>
  );

  const getTitle = (key: SearchHighlightsTitlesKey) => searchHighlightsTitlesMap.get(key);

  const getHighlights = (name: SingleHighlightTypes) => {
    if (highlights && highlights[name]) {
      return (
        <Grid container flexDirection='column'>
          <Typography variant='h4'>{getTitle(name)}</Typography>
          {Object.entries(highlights[name] || {}).map(
            ([key, val]) =>
              val && (
                <LabeledInfoItem
                  key={key}
                  sx={{ mt: 0.25 }}
                  inline
                  label={getTitle(key as SearchHighlightsTitlesKey)}
                  labelWidth={3}
                >
                  {sliceAndHighlightText(val)}
                </LabeledInfoItem>
              )
          )}
        </Grid>
      );
    }

    return null;
  };

  const getListedHighlights = (type: MultipleHighlightTypes) => {
    if (highlights && highlights[type] && highlights[type]!.length > 0) {
      const isTag = (entity: any): entity is Tag => 'important' in entity;
      const isOwnership = (entity: any): entity is OwnershipHighlight =>
        'owner' in entity;
      const isMetadata = (entity: any): entity is MetadataFieldValue => 'field' in entity;
      const isColumn = (entity: any): entity is DataSetStructureHighlight =>
        'labels' in entity;

      const mapItemsToHighlight = (entity: unknown) => {
        if (isTag(entity)) {
          return (
            <TagItem
              sx={{ mr: 0.5 }}
              label={highlightText(entity.name)}
              important={entity.important}
              systemTag={entity.external}
            />
          );
        }

        if (isOwnership(entity)) {
          return (
            entity.owner &&
            entity.title && (
              <S.OwnerItem key={`${entity.owner}-${entity.title}`}>
                {highlightText(entity.owner)}
                <LabelItem sx={{ ml: 0.5 }} labelName={highlightText(entity.title)} />
              </S.OwnerItem>
            )
          );
        }

        if (isMetadata(entity)) {
          return (
            <LabeledInfoItem
              key={entity.field.id}
              sx={{ mt: 0.25 }}
              inline
              label={highlightText(entity.field.name)}
              labelWidth={3}
            >
              {sliceAndHighlightText(
                getMetadataValue(entity.field, entity.value, metadataFormattedDateTime)
              )}
            </LabeledInfoItem>
          );
        }

        if (isColumn(entity)) {
          return (
            <S.StructureItem key={entity.name} container flexDirection='column'>
              {entity.name && (
                <LabeledInfoItem inline label='Column name' labelWidth={3}>
                  {sliceAndHighlightText(entity.name)}
                </LabeledInfoItem>
              )}
              {entity.internalDescription && (
                <LabeledInfoItem inline label='Internal description' labelWidth={3}>
                  {sliceAndHighlightText(entity.internalDescription)}
                </LabeledInfoItem>
              )}
              {entity.externalDescription && (
                <LabeledInfoItem inline label='External description' labelWidth={3}>
                  {sliceAndHighlightText(entity.externalDescription)}
                </LabeledInfoItem>
              )}
              {entity.labels && entity.labels.length > 0 && (
                <LabeledInfoItem inline label='Labels' labelWidth={3}>
                  <Grid container mt={0.5}>
                    {entity.labels.map(({ id, name: labelName, external }) => (
                      <LabelItem
                        key={id}
                        sx={{ ml: 0.5 }}
                        systemLabel={external}
                        labelName={highlightText(labelName)}
                      />
                    ))}
                  </Grid>
                </LabeledInfoItem>
              )}
            </S.StructureItem>
          );
        }

        return null;
      };

      return (
        <Grid container flexDirection='column'>
          <Typography variant='h4'>{getTitle(type)}</Typography>
          <Grid container mt={0.5} flexDirection={type === 'tags' ? 'row' : 'column'}>
            {highlights[type]?.map(mapItemsToHighlight)}
          </Grid>
        </Grid>
      );
    }

    return null;
  };

  return highlights ? (
    <S.Container container>
      {getHighlights('dataEntity')}
      {getHighlights('dataSource')}
      {getHighlights('namespace')}
      {getListedHighlights('tags')}
      {getListedHighlights('owners')}
      {getListedHighlights('metadata')}
      {getListedHighlights('datasetStructure')}
    </S.Container>
  ) : null;
};

export default SearchHighlights;
