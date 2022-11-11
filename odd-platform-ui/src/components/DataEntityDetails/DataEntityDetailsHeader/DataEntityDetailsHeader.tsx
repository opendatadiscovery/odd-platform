import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  AppButton,
  EntityClassItem,
  EntityTypeItem,
  LabelItem,
  WithFeature,
} from 'components/shared';
import { WithPermissions } from 'components/shared/contexts';
import { DataEntityDetails, Feature, Permission } from 'generated-sources';
import { AddIcon, EditIcon, SlackIcon, TimeGapIcon } from 'components/shared/Icons';
import { formatDistanceToNowStrict } from 'date-fns';
import CreateMessageForm from '../DataCollaboration/CreateMessageForm/CreateMessageForm';
import InternalNameFormDialog from '../InternalNameFormDialog/InternalNameFormDialog';
import DataEntityGroupControls from '../DataEntityGroup/DataEntityGroupControls/DataEntityGroupControls';
import * as S from './DataEntityDetailsHeaderStyles';

interface DataEntityDetailsHeaderProps {
  dataEntityId: DataEntityDetails['id'];
  internalName: DataEntityDetails['internalName'];
  externalName: DataEntityDetails['externalName'];
  entityClasses: DataEntityDetails['entityClasses'];
  type: DataEntityDetails['type'];
  manuallyCreated: DataEntityDetails['manuallyCreated'];
  updatedAt: DataEntityDetails['updatedAt'];
}
const DataEntityDetailsHeader: React.FC<DataEntityDetailsHeaderProps> = ({
  updatedAt,
  entityClasses,
  manuallyCreated,
  externalName,
  internalName,
  type,
  dataEntityId,
}) => {
  const entityUpdatedAt = React.useMemo(
    () =>
      updatedAt && (
        <>
          <TimeGapIcon />
          <Typography variant='body1' sx={{ ml: 1, whiteSpace: 'nowrap' }}>
            {formatDistanceToNowStrict(updatedAt, { addSuffix: true })}
          </Typography>
        </>
      ),
    [updatedAt]
  );

  const originalName = React.useMemo(
    () =>
      internalName &&
      externalName && (
        <Grid container alignItems='center' width='auto'>
          <LabelItem labelName='Original' variant='body1' />
          <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
            {externalName}
          </Typography>
        </Grid>
      ),
    [internalName, externalName]
  );

  return (
    <Grid container flexDirection='column' alignItems='flex-start'>
      <S.Caption container alignItems='center' flexWrap='nowrap'>
        <Grid container item lg={11} alignItems='center' flexWrap='nowrap'>
          <Typography variant='h1' noWrap sx={{ mr: 1 }}>
            {internalName || externalName}
          </Typography>
          {entityClasses?.map(entityClass => (
            <EntityClassItem
              sx={{ ml: 0.5 }}
              key={entityClass.id}
              entityClassName={entityClass.name}
            />
          ))}
          {type && <EntityTypeItem sx={{ ml: 1 }} entityTypeName={type.name} />}
          <S.InternalNameEditBtnContainer>
            <WithPermissions permissionTo={Permission.DATA_ENTITY_INTERNAL_NAME_UPDATE}>
              <InternalNameFormDialog
                btnCreateEl={
                  <AppButton
                    size='small'
                    color='tertiary'
                    sx={{ ml: 1 }}
                    startIcon={internalName ? <EditIcon /> : <AddIcon />}
                  >
                    {`${internalName ? 'Edit custom' : 'Add custom'} name`}
                  </AppButton>
                }
              />
            </WithPermissions>
          </S.InternalNameEditBtnContainer>
        </Grid>
        <Grid container item lg={1} sx={{ ml: 1 }} alignItems='center' flexWrap='nowrap'>
          <WithFeature featureName={Feature.DATA_COLLABORATION}>
            <CreateMessageForm
              dataEntityId={dataEntityId}
              btnCreateEl={
                <AppButton
                  size='medium'
                  color='primaryLight'
                  startIcon={<SlackIcon />}
                  sx={{ mr: 1 }}
                >
                  Share
                </AppButton>
              }
            />
          </WithFeature>
          {entityUpdatedAt}
          {manuallyCreated && (
            <DataEntityGroupControls
              internalName={internalName}
              externalName={externalName}
            />
          )}
        </Grid>
      </S.Caption>
      {originalName}
    </Grid>
  );
};

export default DataEntityDetailsHeader;
