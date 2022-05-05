import React from 'react';
import { Grid, Typography } from '@mui/material';
import * as S from 'components/Search/Results/ResultItem/ResultItemPreview/ResultItemPreviewStyles';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import {
  DataEntityDetails,
  MetadataFieldType,
  MetadataFieldValue,
} from 'generated-sources';
import BooleanFormatted from 'components/shared/BooleanFormatted/BooleanFormatted';
import { format } from 'date-fns';
import AppCircularProgress from 'components/shared/AppCircularProgress/AppCircularProgress';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch } from 'lib/hooks';
import { fetchDataEntityDetails } from 'redux/thunks';

interface ResultItemPreviewProps {
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  isDataEntityLoading: boolean;
  predefinedMetadata: MetadataFieldValue[];
  customMetadata: MetadataFieldValue[];
  fetchData?: boolean;
}

const ResultItemPreview: React.FC<ResultItemPreviewProps> = ({
  dataEntityId,
  dataEntityDetails,
  isDataEntityLoading,
  predefinedMetadata,
  customMetadata,
  fetchData,
}) => {
  const dispatch = useAppDispatch();
  const metadataNum = 5;

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
      {!isDataEntityLoading ? (
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
      ) : (
        <Grid container justifyContent="center">
          <AppCircularProgress
            background="transparent"
            progressBackground="dark"
            size={50}
          />
        </Grid>
      )}
    </S.Container>
  );
};
export default ResultItemPreview;
