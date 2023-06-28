import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldById } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import { Button, LabelItem, MetadataItem } from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import isEmpty from 'lodash/isEmpty';
import { useDataSetFieldMetrics } from 'lib/hooks/api';
import { useTranslation } from 'react-i18next';
import DatasetFieldTerms from './DatasetFieldTerms/DatasetFieldTerms';
import useStructure from '../../lib/useStructure';
import DatasetFieldMetrics from './DatasetFieldMetrics/DatasetFieldMetrics';
import DatasetFieldOverviewEnums from './DatasetFieldOverviewEnums/DatasetFieldOverviewEnums';
import DatasetFieldLabelsForm from './DatasetFieldLabelsForm/DatasetFieldLabelsForm';
import DatasetFieldDescriptionForm from './DatasetFieldDescriptionForm/DatasetFieldDescriptionForm';
import KeyFieldLabel from '../../../shared/KeyFieldLabel/KeyFieldLabel';
import DatasetFieldStats from './DatasetFieldStats/DatasetFieldStats';
import * as S from './DatasetFieldOverview.styles';

const DatasetFieldOverview: React.FC = () => {
  const { t } = useTranslation();
  const { selectedFieldId, datasetFieldRowsCount } = useStructure();

  const field = useAppSelector(getDatasetFieldById(selectedFieldId));
  const isUniqStatsExists = Object.values(field?.stats || {}).filter(Boolean).length > 0;

  const {
    data: metricSet,
    isLoading: isMetricsLoading,
    isSuccess: isMetricsLoaded,
  } = useDataSetFieldMetrics({ datasetFieldId: field?.id });

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
      <Grid container flexWrap='nowrap'>
        <Typography variant='h1' title={field?.name} noWrap>
          {field?.name}
        </Typography>
        {field?.isPrimaryKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='primary' />}
        {field?.isSortKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='sort' />}
        {field?.type.isNullable && <KeyFieldLabel sx={{ ml: 1 }} keyType='nullable' />}
      </Grid>
      <Grid mt={2} flexDirection='column'>
        {isUniqStatsExists && field && (
          <DatasetFieldStats datasetField={field} rowsCount={datasetFieldRowsCount} />
        )}
      </Grid>
      {getOverviewSection(t('DEFAULT VALUE'), field.defaultValue)}
      {getOverviewSection(t('EXTERNAL DESCRIPTION'), field.externalDescription)}
      <S.SectionContainer container>
        <Grid container justifyContent='space-between'>
          <Typography variant='h5' color='texts.hint'>
            {t('INTERNAL DESCRIPTION')}
          </Typography>
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_DESCRIPTION_UPDATE}
            renderContent={({ isAllowedTo: editDescription }) => (
              <DatasetFieldDescriptionForm
                datasetFieldId={field.id}
                description={field.internalDescription}
                btnCreateEl={
                  <Button
                    text={
                      field.internalDescription
                        ? t('Edit description')
                        : t('Add description')
                    }
                    disabled={!editDescription}
                    buttonType='secondary-m'
                    sx={{ mr: 1 }}
                  />
                }
              />
            )}
          />
        </Grid>
        <Typography mt={1} variant='subtitle1'>
          {field?.internalDescription || t('Description is not created yet')}
        </Typography>
      </S.SectionContainer>
      <S.SectionContainer container>
        <Grid container justifyContent='space-between'>
          <Typography variant='h5' color='texts.hint'>
            {t('LABELS')}
          </Typography>
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_LABELS_UPDATE}
            renderContent={({ isAllowedTo: editLabels }) => (
              <DatasetFieldLabelsForm
                datasetFieldId={field.id}
                labels={field.labels}
                btnCreateEl={
                  <Button
                    text={
                      field.labels && field.labels?.length > 0
                        ? t('Edit labels')
                        : t('Add labels')
                    }
                    data-qa='edit_labels'
                    disabled={!editLabels}
                    buttonType='secondary-m'
                    sx={{ mr: 1 }}
                  />
                }
              />
            )}
          />
        </Grid>
        <Grid container flexDirection='column' alignItems='flex-start'>
          {field.labels && field.labels?.length > 0 ? (
            <Grid container mt={1}>
              {field.labels &&
                field.labels.map(({ name, external }) => (
                  <LabelItem key={name} labelName={name} systemLabel={external} />
                ))}
            </Grid>
          ) : (
            <Typography mt={1} variant='subtitle1'>
              {t('Labels are not created yet')}
            </Typography>
          )}
        </Grid>
      </S.SectionContainer>
      <DatasetFieldOverviewEnums field={field} />
      <DatasetFieldTerms fieldTerms={field?.terms} datasetFieldId={field.id} />
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
