import React, { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldById, getIsEntityStatusDeleted } from 'redux/selectors';
import { MetadataItem } from 'components/shared/elements';
import { useDataSetFieldMetrics } from 'lib/hooks/api';
import { useDataEntityRouteParams } from 'routes';
import DatasetFieldHeader from './DatasetFieldHeader/DatasetFieldHeader';
import DatasetFieldDescription from './DatasetFieldDescription/DatasetFieldDescription';
import DatasetFieldTerms from './DatasetFieldTerms/DatasetFieldTerms';
import useStructure from '../../lib/useStructure';
import DatasetFieldMetrics from './DatasetFieldMetrics/DatasetFieldMetrics';
import DatasetFieldOverviewEnums from './DatasetFieldOverviewEnums/DatasetFieldOverviewEnums';
import DatasetFieldStats from './DatasetFieldStats/DatasetFieldStats';
import * as S from './DatasetFieldOverview.styles';
import DatasetFieldTags from './DatasetFieldTags/DatasetFieldTags';

const DatasetFieldOverview: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useDataEntityRouteParams();
  const { selectedFieldId, datasetFieldRowsCount } = useStructure();

  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));
  const field = useAppSelector(getDatasetFieldById(selectedFieldId));
  const isUniqStatsExists = Object.values(field?.stats || {}).filter(Boolean).length > 0;

  const {
    data: metricSet,
    isLoading: isMetricsLoading,
    isSuccess: isMetricsLoaded,
  } = useDataSetFieldMetrics({ datasetFieldId: field?.id });

  const terms = useMemo(
    () => field?.terms?.map(linkedTerm => linkedTerm.term),
    [field?.terms]
  );

  if (isEmpty(field)) return null;

  const getOverviewSection = (title: string, data: undefined | React.ReactNode) =>
    data ? (
      <S.SectionContainer container>
        <Typography variant='h5' color='texts.hint'>
          {title}
        </Typography>
        <Typography mt={1} variant='subtitle1'>
          {data}
        </Typography>
      </S.SectionContainer>
    ) : null;

  return (
    <S.Container container>
      <DatasetFieldHeader field={field} />
      <Grid mt={2} flexDirection='column'>
        {isUniqStatsExists && field && (
          <DatasetFieldStats datasetField={field} rowsCount={datasetFieldRowsCount} />
        )}
      </Grid>
      {getOverviewSection(t('DEFAULT VALUE'), field.defaultValue)}
      {getOverviewSection(t('EXTERNAL DESCRIPTION'), field.externalDescription)}
      <S.SectionContainer container>
        <DatasetFieldDescription
          datasetFieldId={field.id}
          description={field.internalDescription ?? ''}
          terms={terms}
          isStatusDeleted={isStatusDeleted}
        />
      </S.SectionContainer>
      <DatasetFieldTags
        tags={field.tags}
        datasetFieldId={field.id}
        isStatusDeleted={isStatusDeleted}
      />
      <DatasetFieldOverviewEnums field={field} isStatusDeleted={isStatusDeleted} />
      <DatasetFieldTerms
        fieldTerms={field?.terms}
        datasetFieldId={field.id}
        isStatusDeleted={isStatusDeleted}
      />
      {field.metadata &&
        field.metadata?.length > 0 &&
        getOverviewSection(
          t('METADATA'),
          field.metadata?.map(metadata => (
            <MetadataItem key={metadata.field.id} metadata={metadata} />
          ))
        )}
      {isMetricsLoaded && metricSet?.metricFamilies?.length !== 0 && (
        <DatasetFieldMetrics
          metricFamilies={metricSet?.metricFamilies}
          isLoading={isMetricsLoading}
        />
      )}
    </S.Container>
  );
};

export default DatasetFieldOverview;
