import React, { type FC, useCallback, useMemo, useState } from 'react';
import { InformationIcon } from 'components/shared/icons';
import { Grid, Typography } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { useDataEntityDetails } from 'lib/hooks';
import * as S from './DataEntityDetailsPreview.styles';
import AppCircularProgress from '../AppCircularProgress/AppCircularProgress';
import NumberFormatted from '../NumberFormatted/NumberFormatted';
import AppTooltip from '../AppTooltip/AppTooltip';
import MetadataItem from '../MetadataItem/MetadataItem';
import TruncatedList from '../TruncatedList/TruncatedList';
import TagItem from '../TagItem/TagItem';

interface DataEntityDetailsPreviewProps {
  dataEntityId: number;
}

const DataEntityDetailsPreview: FC<DataEntityDetailsPreviewProps> = ({
  dataEntityId,
}) => {
  const [enabled, setEnabled] = useState(false);
  const { isLoading, data: dataEntityDetails } = useDataEntityDetails({
    dataEntityId,
    enabled,
  });

  const metadataNum = 5;

  const customMetadata = useMemo(() => {
    if (!dataEntityDetails) return [];

    return dataEntityDetails.metadataFieldValues.filter(
      ({ field }) => field.origin === 'INTERNAL'
    );
  }, [dataEntityDetails?.metadataFieldValues]);

  const predefinedMetadata = useMemo(() => {
    if (!dataEntityDetails) return [];

    return dataEntityDetails.metadataFieldValues.filter(
      ({ field }) => field.origin === 'EXTERNAL'
    );
  }, [dataEntityDetails?.metadataFieldValues]);

  const tagsEllipsis = useCallback(
    () => (
      <Typography variant='body1' color='texts.hint' sx={{ ml: 1 }} component='span'>
        few tags more
      </Typography>
    ),
    []
  );

  const content = useMemo(
    () => (
      <S.Container>
        {isLoading ? (
          <Grid container justifyContent='center'>
            <AppCircularProgress
              background='transparent'
              progressBackground='dark'
              size={50}
            />
          </Grid>
        ) : (
          <>
            <Grid container>
              <S.BlockContainer>
                <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
                  <Typography variant='h4' color='text.primary'>
                    Tags
                  </Typography>
                  <Typography variant='subtitle1' color='texts.info'>
                    <NumberFormatted value={dataEntityDetails?.tags?.length} /> tags
                  </Typography>
                </Grid>
                {dataEntityDetails?.tags?.length ? (
                  <TruncatedList items={dataEntityDetails.tags} ellipsis={tagsEllipsis}>
                    {tag => (
                      <TagItem
                        sx={{ mr: 0.5 }}
                        key={tag.id}
                        important={tag.important}
                        label={tag.name}
                      />
                    )}
                  </TruncatedList>
                ) : (
                  <Typography variant='body1' color='texts.secondary'>
                    No tags
                  </Typography>
                )}
              </S.BlockContainer>
              <S.BlockContainer>
                <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
                  <Typography variant='h4' color='text.primary'>
                    Custom metadata
                  </Typography>
                  <Typography variant='subtitle1' color='texts.info'>
                    <NumberFormatted value={customMetadata.length} /> fields
                  </Typography>
                </Grid>
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
                  <Typography variant='body1' color='texts.secondary'>
                    No custom metadata
                  </Typography>
                )}
              </S.BlockContainer>
            </Grid>
            <Grid container>
              <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography variant='h4' color='text.primary'>
                  Predefined metadata
                </Typography>
                <Typography variant='subtitle1' color='texts.info'>
                  <NumberFormatted value={predefinedMetadata.length} /> fields
                </Typography>
              </Grid>
              {predefinedMetadata.length ? (
                predefinedMetadata
                  .slice(0, metadataNum)
                  .map(metadata => (
                    <MetadataItem
                      key={metadata.field.id}
                      metadata={metadata}
                      labelWidth={5}
                    />
                  ))
              ) : (
                <Typography variant='body1' color='texts.secondary'>
                  No predefined metadata
                </Typography>
              )}
            </Grid>
            <S.AboutContainer container sx={{ mt: 2 }} data-color-mode='light'>
              <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
                <Typography variant='h4' color='text.primary'>
                  About
                </Typography>
              </Grid>
              <S.AboutText variant='body1' color='texts.secondary'>
                {dataEntityDetails?.internalDescription ? (
                  <MDEditor.Markdown source={dataEntityDetails?.internalDescription} />
                ) : (
                  'Not created'
                )}
              </S.AboutText>
            </S.AboutContainer>
          </>
        )}
      </S.Container>
    ),
    [
      isLoading,
      dataEntityDetails?.internalDescription,
      customMetadata,
      predefinedMetadata,
      dataEntityDetails?.tags,
    ]
  );

  return (
    <AppTooltip
      checkForOverflow={false}
      title={content}
      onOpen={() => setEnabled(true)}
      onClose={() => setEnabled(false)}
    >
      <InformationIcon />
    </AppTooltip>
  );
};

export default DataEntityDetailsPreview;
