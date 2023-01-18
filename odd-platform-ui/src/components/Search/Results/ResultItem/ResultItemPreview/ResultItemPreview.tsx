import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  AppCircularProgress,
  BooleanFormatted,
  LabeledInfoItem,
  NumberFormatted,
} from 'components/shared';
import type { MetadataFieldValue } from 'generated-sources';
import { MetadataFieldType } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchDataEntityDetails } from 'redux/thunks';
import {
  getDataEntityCustomMetadataList,
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors';
import { useAppDateTime } from 'lib/hooks';
import isEmpty from 'lodash/isEmpty';
import MDEditor from '@uiw/react-md-editor';
import * as S from './ResultItemPreviewStyles';

interface ResultItemPreviewProps {
  dataEntityId: number;
}

const ResultItemPreview: React.FC<ResultItemPreviewProps> = ({ dataEntityId }) => {
  const dispatch = useAppDispatch();
  const { metadataFormattedDateTime } = useAppDateTime();

  const metadataNum = 5;

  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));
  const predefinedMetadata = useAppSelector(
    getDataEntityPredefinedMetadataList(dataEntityId)
  );
  const customMetadata = useAppSelector(getDataEntityCustomMetadataList(dataEntityId));
  const { isLoading: isDataEntityDetailsFetching } = useAppSelector(
    getDataEntityDetailsFetchingStatuses
  );

  React.useEffect(() => {
    if (isEmpty(dataEntityDetails)) dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, []);

  const getMetadataValue = (metadataItem: MetadataFieldValue) => {
    let metadataVal;
    try {
      switch (metadataItem.field.type) {
        case MetadataFieldType.BOOLEAN:
          metadataVal = <BooleanFormatted value={metadataItem.value} />;
          break;
        case MetadataFieldType.DATETIME:
          metadataVal = metadataFormattedDateTime(new Date(metadataItem.value).getTime());
          break;
        case MetadataFieldType.ARRAY:
          metadataVal = JSON.parse(metadataItem.value).join(', ');
          break;
        default:
          metadataVal = metadataItem.value;
      }
    } catch {
      metadataVal = metadataItem.value;
    }
    return metadataVal;
  };

  return (
    <S.Container container>
      {isDataEntityDetailsFetching ? (
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
            <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
              <Typography variant='h4' color='text.primary'>
                Custom metadata
              </Typography>
              <Typography variant='subtitle1' color='texts.info'>
                <NumberFormatted value={customMetadata.length} /> fields
              </Typography>
            </Grid>
            {customMetadata.length ? (
              customMetadata.slice(0, metadataNum).map(metadata => (
                <LabeledInfoItem
                  key={metadata.field.id}
                  inline
                  label={metadata.field.name}
                  labelWidth={4}
                >
                  {getMetadataValue(metadata)}
                </LabeledInfoItem>
              ))
            ) : (
              <Typography variant='body1' color='texts.secondary'>
                No custom metadata
              </Typography>
            )}
          </Grid>
          <Grid container sx={{ mt: 2 }}>
            <Grid container justifyContent='space-between' sx={{ mb: 1 }}>
              <Typography variant='h4' color='text.primary'>
                Predefined metadata
              </Typography>
              <Typography variant='subtitle1' color='texts.info'>
                <NumberFormatted value={predefinedMetadata.length} /> fields
              </Typography>
            </Grid>
            {predefinedMetadata.length ? (
              predefinedMetadata.slice(0, metadataNum).map(metadata => (
                <LabeledInfoItem
                  key={metadata.field.id}
                  inline
                  label={metadata.field.name}
                  labelWidth={4}
                >
                  {getMetadataValue(metadata)}
                </LabeledInfoItem>
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
  );
};
export default ResultItemPreview;
