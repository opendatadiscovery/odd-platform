import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  AppCircularProgress,
  BooleanFormatted,
  LabeledInfoItem,
  NumberFormatted,
} from 'components/shared';
import { MetadataFieldType, MetadataFieldValue } from 'generated-sources';
import { format } from 'date-fns';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchDataEntityDetails } from 'redux/thunks';
import {
  getDataEntityCustomMetadataList,
  getDataEntityDetails,
  getDataEntityDetailsFetchingStatuses,
  getDataEntityPredefinedMetadataList,
} from 'redux/selectors';
import * as S from './ResultItemPreviewStyles';

interface ResultItemPreviewProps {
  dataEntityId: number;
  fetchData?: boolean;
}

const ResultItemPreview: React.FC<ResultItemPreviewProps> = ({
  dataEntityId,
  fetchData,
}) => {
  const dispatch = useAppDispatch();
  const metadataNum = 5;

  const dataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );
  const predefinedMetadata = useAppSelector(
    getDataEntityPredefinedMetadataList(dataEntityId)
  );
  const customMetadata = useAppSelector(
    getDataEntityCustomMetadataList(dataEntityId)
  );
  const { isLoading: isDataEntityDetailsFetching } = useAppSelector(
    getDataEntityDetailsFetchingStatuses
  );

  React.useEffect(() => {
    if (fetchData && !dataEntityDetails)
      dispatch(fetchDataEntityDetails({ dataEntityId }));
  }, [fetchData, dataEntityDetails, dataEntityId, fetchDataEntityDetails]);

  const getMetadataValue = (metadataItem: MetadataFieldValue) => {
    let metadataVal;
    try {
      switch (metadataItem.field.type) {
        case MetadataFieldType.BOOLEAN:
          metadataVal = <BooleanFormatted value={metadataItem.value} />;
          break;
        case MetadataFieldType.DATETIME:
          metadataVal = format(new Date(metadataItem.value), 'd MMM yyyy');
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

  const getDescription = React.useCallback(
    () => (
      <ReactMarkdown className="markdown-body" remarkPlugins={[remarkGfm]}>
        {dataEntityDetails?.internalDescription}
      </ReactMarkdown>
    ),
    [dataEntityDetails]
  );

  return (
    <S.Container container>
      {isDataEntityDetailsFetching ? (
        <Grid container justifyContent="center">
          <AppCircularProgress
            background="transparent"
            progressBackground="dark"
            size={50}
          />
        </Grid>
      ) : (
        <>
          <Grid container>
            <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h4" color="text.primary">
                Custom metadata
              </Typography>
              <Typography variant="subtitle1" color="texts.info">
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
              <Typography variant="body1" color="texts.secondary">
                No custom metadata
              </Typography>
            )}
          </Grid>
          <Grid container sx={{ mt: 2 }}>
            <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h4" color="text.primary">
                Predefined metadata
              </Typography>
              <Typography variant="subtitle1" color="texts.info">
                <NumberFormatted value={predefinedMetadata.length} />{' '}
                fields
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
              <Typography variant="body1" color="texts.secondary">
                No predefined metadata
              </Typography>
            )}
          </Grid>
          <S.AboutContainer container sx={{ mt: 2 }}>
            <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h4" color="text.primary">
                About
              </Typography>
            </Grid>
            <S.AboutText variant="body1" color="texts.secondary">
              {dataEntityDetails?.internalDescription
                ? getDescription()
                : 'Not created'}
            </S.AboutText>
          </S.AboutContainer>
        </>
      )}
    </S.Container>
  );
};
export default ResultItemPreview;
