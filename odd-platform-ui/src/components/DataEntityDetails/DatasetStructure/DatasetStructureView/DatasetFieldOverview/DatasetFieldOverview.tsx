import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldById, getDatasetFieldEnums } from 'redux/selectors';
import { Grid, Typography } from '@mui/material';
import { AddIcon, EditIcon } from 'components/shared/Icons';
import { AppButton, LabeledInfoItem, LabelItem } from 'components/shared';
import { DataSetFieldTypeTypeEnum, Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import DatasetFieldEnumsForm from 'components/DataEntityDetails/DatasetStructure/DatasetStructureView/DatasetFieldOverview/DatasetFieldEnumsForm/DatasetFieldEnumsForm';
import { fetchDataSetFieldEnum } from 'redux/thunks';
import DatasetFieldLabelsForm from './DatasetFieldLabelsForm/DatasetFieldLabelsForm';
import DatasetFieldDescriptionForm from './DatasetFieldDescriptionForm/DatasetFieldDescriptionForm';
import KeyFieldLabel from '../shared/KeyFieldLabel/KeyFieldLabel';
import { useStructureContext } from '../../StructureContext/StructureContext';
import DatasetFieldStats from './DatasetFieldStats/DatasetFieldStats';
import * as S from './DatasetFieldOverviewStyles';

const DatasetFieldOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedFieldId, datasetRowsCount } = useStructureContext();

  const field = useAppSelector(getDatasetFieldById(selectedFieldId));
  const datasetFieldEnums = useAppSelector(getDatasetFieldEnums(selectedFieldId));
  const isUniqStatsExists = Object.values(field?.stats || {}).filter(Boolean).length > 0;

  React.useEffect(() => {
    if (
      (field?.type.type === DataSetFieldTypeTypeEnum.STRING ||
        field?.type.type === DataSetFieldTypeTypeEnum.INTEGER) &&
      selectedFieldId
    ) {
      dispatch(fetchDataSetFieldEnum({ datasetFieldId: selectedFieldId }));
    }
  }, [selectedFieldId]);

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
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_DESCRIPTION_UPDATE}
            renderContent={({ isAllowedTo: editDescription }) => (
              <DatasetFieldDescriptionForm
                datasetFieldId={field.id}
                description={field.internalDescription}
                btnCreateEl={
                  <AppButton
                    disabled={!editDescription}
                    size='medium'
                    color='primaryLight'
                    startIcon={field.internalDescription ? <EditIcon /> : <AddIcon />}
                    sx={{ mr: 1 }}
                  >
                    {field.internalDescription ? 'Edit' : 'Add'} description
                  </AppButton>
                }
              />
            )}
          />
        </Grid>
        <Typography mt={1} variant='subtitle1'>
          {field?.internalDescription || 'Description is not created yet'}
        </Typography>
      </Grid>
      <Grid container mt={2} flexDirection='column'>
        <Grid container justifyContent='space-between'>
          <Typography variant='h3'>Labels</Typography>
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_LABELS_UPDATE}
            renderContent={({ isAllowedTo: editLabels }) => (
              <DatasetFieldLabelsForm
                datasetFieldId={field.id}
                labels={field.labels}
                btnCreateEl={
                  <AppButton
                    disabled={!editLabels}
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
            )}
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
              Labels are not created yet
            </Typography>
          )}
        </Grid>
      </Grid>
      {(field.type.type === DataSetFieldTypeTypeEnum.STRING ||
        field.type.type === DataSetFieldTypeTypeEnum.INTEGER) && (
        <Grid container mt={2} flexDirection='column'>
          <Grid container justifyContent='space-between'>
            <Typography variant='h3'>Enums</Typography>
            <WithPermissions
              permissionTo={Permission.DATASET_FIELD_ENUMS_UPDATE}
              renderContent={({ isAllowedTo: editEnums }) => (
                <DatasetFieldEnumsForm
                  datasetFieldId={field.id}
                  datasetFieldName={field.name}
                  datasetFieldType={field.type.type}
                  defaultEnums={datasetFieldEnums}
                  btnCreateEl={
                    <AppButton
                      disabled={!editEnums}
                      size='medium'
                      color='primaryLight'
                      startIcon={field.enumValueCount ? <EditIcon /> : <AddIcon />}
                      sx={{ mr: 1 }}
                    >
                      {field.enumValueCount ? 'Edit' : 'Add'} enums
                    </AppButton>
                  }
                />
              )}
            />
          </Grid>
          <Grid container flexDirection='column' alignItems='flex-start'>
            {field.enumValueCount ? (
              <Grid container mt={1}>
                {datasetFieldEnums.map(({ name, description, id }) => (
                  <LabeledInfoItem key={id} inline label={name} labelWidth={4}>
                    {description}
                  </LabeledInfoItem>
                ))}
              </Grid>
            ) : (
              <Typography mt={1} variant='subtitle1'>
                Enums are not created yet
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </S.Container>
  );
};

export default DatasetFieldOverview;
