import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldById } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import DatasetFieldDescriptionForm from 'components/DataEntityDetails/DatasetStructure/DatasetStructureView/DatasetFieldOverview/DatasetFieldDescriptionForm/DatasetFieldDescriptionForm';
import { AddIcon, EditIcon } from 'components/shared/Icons';
import { AppButton, LabelItem } from 'components/shared';
import DatasetFieldLabelsForm from 'components/DataEntityDetails/DatasetStructure/DatasetStructureView/DatasetFieldOverview/DatasetFieldLabelsForm/DatasetFieldLabelsForm';
import KeyFieldLabel from '../shared/KeyFieldLabel/KeyFieldLabel';
import { useStructureContext } from '../../StructureContext/StructureContext';
import DatasetFieldStats from './DatasetFieldStats/DatasetFieldStats';
import * as S from './DatasetFieldOverviewStyles';

const DatasetFieldOverview: React.FC = () => {
  const { selectedFieldId, datasetRowsCount } = useStructureContext();

  const field = useAppSelector(getDatasetFieldById(selectedFieldId));
  const isUniqStatsExists = Object.values(field?.stats || {}).filter(Boolean).length > 0;

  if (!field) return null;

  return (
    <S.Container container>
      <Grid container>
        <Typography variant='h1' title={field?.name} noWrap>
          {field?.name}
        </Typography>
        {field?.isPrimaryKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='primary' />}
        {field?.isSortKey && <KeyFieldLabel sx={{ ml: 1 }} keyType='sort' />}
        {field?.isNullable && <KeyFieldLabel sx={{ ml: 1 }} keyType='nullable' />}
      </Grid>
      <Grid mt={2} flexDirection='column'>
        {isUniqStatsExists && field && (
          <DatasetFieldStats datasetField={field} rowsCount={datasetRowsCount} />
        )}
      </Grid>
      {field?.defaultValue && (
        <Grid container mt={2} flexDirection='column'>
          <Typography variant='h3'>Default value</Typography>
          <Typography mt={1} variant='subtitle1'>
            {field?.defaultValue}
          </Typography>
        </Grid>
      )}
      {field?.externalDescription && (
        <Grid container mt={2} flexDirection='column'>
          <Typography variant='h3'>External description</Typography>
          <Typography mt={1} variant='subtitle1'>
            {field?.externalDescription}
          </Typography>
        </Grid>
      )}
      <Grid container mt={2} flexDirection='column'>
        <Grid container justifyContent='space-between'>
          <Typography variant='h3'>Internal description</Typography>
          <DatasetFieldDescriptionForm
            datasetFieldId={field.id}
            description={field.internalDescription}
            btnCreateEl={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={field.internalDescription ? <EditIcon /> : <AddIcon />}
                sx={{ mr: 1 }}
              >
                {field.internalDescription ? 'Edit' : 'Add'} description
              </AppButton>
            }
          />
        </Grid>
        <Typography mt={1} variant='subtitle1'>
          {field?.internalDescription || 'Description is not created yet'}
        </Typography>
      </Grid>
      <Grid container mt={2} flexDirection='column'>
        <Grid container justifyContent='space-between'>
          <Typography variant='h3'>Labels</Typography>
          <DatasetFieldLabelsForm
            datasetFieldId={field.id}
            labels={field.labels}
            btnCreateEl={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={
                  field.labels && field.labels.length > 0 ? <EditIcon /> : <AddIcon />
                }
                sx={{ mr: 1 }}
              >
                {field.labels && field.labels?.length > 0 ? 'Edit' : 'Add'} labels
              </AppButton>
            }
          />
        </Grid>
        <Grid container flexDirection='column' alignItems='flex-start'>
          {field.labels && field.labels.length > 0 ? (
            <Grid container mt={1}>
              {field.labels &&
                field.labels.map(({ name, external }) => (
                  <LabelItem labelName={name} systemLabel={external} />
                ))}
            </Grid>
          ) : (
            <Typography mt={1} variant='subtitle1'>
              Labels is not created yet
            </Typography>
          )}
        </Grid>
      </Grid>
    </S.Container>
  );
};

export default DatasetFieldOverview;
