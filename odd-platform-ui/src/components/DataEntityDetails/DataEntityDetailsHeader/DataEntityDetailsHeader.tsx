import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Button,
  EntityClassItem,
  EntityStatus,
  EntityTypeItem,
  LabelItem,
  MetadataStale,
  WithFeature,
} from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { type DataEntityDetails, Feature, Permission } from 'generated-sources';
import { AddIcon, EditIcon, SlackIcon, TimeGapIcon } from 'components/shared/icons';
import { useAppDateTime } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getIsDataEntityBelongsToClass, getIsEntityStatusDeleted } from 'redux/selectors';
import DataEntityGroupForm from '../DataEntityGroup/DataEntityGroupForm/DataEntityGroupForm';
import CreateMessageForm from '../DataCollaboration/CreateMessageForm/CreateMessageForm';
import InternalNameFormDialog from '../InternalNameFormDialog/InternalNameFormDialog';

interface DataEntityDetailsHeaderProps {
  dataEntityId: DataEntityDetails['id'];
  internalName: DataEntityDetails['internalName'];
  externalName: DataEntityDetails['externalName'];
  entityClasses: DataEntityDetails['entityClasses'];
  type: DataEntityDetails['type'];
  manuallyCreated: DataEntityDetails['manuallyCreated'];
  lastIngestedAt: DataEntityDetails['lastIngestedAt'];
  status: DataEntityDetails['status'];
  isStale: DataEntityDetails['isStale'];
}
const DataEntityDetailsHeader: React.FC<DataEntityDetailsHeaderProps> = ({
  lastIngestedAt,
  entityClasses,
  manuallyCreated,
  externalName,
  internalName,
  type,
  dataEntityId,
  status,
  isStale,
}) => {
  const { formatDistanceToNowStrict } = useAppDateTime();
  const { isDEG } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  const entityLastIngestedAt = lastIngestedAt ? (
    <>
      {isStale ? (
        <MetadataStale isStale={isStale} lastIngestedAt={lastIngestedAt} />
      ) : (
        <TimeGapIcon />
      )}
      <Typography variant='body1' sx={{ mx: 1, whiteSpace: 'nowrap' }}>
        {formatDistanceToNowStrict(lastIngestedAt, { addSuffix: true })}
      </Typography>
    </>
  ) : null;

  const originalName = internalName && externalName && (
    <Grid container alignItems='center' width='auto'>
      <LabelItem labelName='Original' variant='body1' />
      <Typography variant='body1' sx={{ ml: 0.5 }} noWrap>
        {externalName}
      </Typography>
    </Grid>
  );

  return (
    <Grid container flexDirection='column' alignItems='flex-start'>
      <Grid container alignItems='center' flexWrap='nowrap'>
        <Grid container item lg={7} alignItems='center' flexWrap='nowrap'>
          <Typography variant='h0' noWrap sx={{ mr: 1 }}>
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
          {!isStatusDeleted && (
            <WithPermissions permissionTo={Permission.DATA_ENTITY_INTERNAL_NAME_UPDATE}>
              <InternalNameFormDialog
                btnCreateEl={
                  <Button
                    text={internalName ? 'Edit' : 'Add business name'}
                    data-qa='add_business_name'
                    buttonType='tertiary-m'
                    sx={{ ml: 1 }}
                    startIcon={internalName ? <EditIcon /> : <AddIcon />}
                  />
                }
              />
            </WithPermissions>
          )}
        </Grid>
        <Grid
          container
          item
          lg={5}
          sx={{ ml: 1 }}
          alignItems='center'
          flexWrap='nowrap'
          justifyContent='flex-end'
        >
          {entityLastIngestedAt}
          <WithPermissions
            permissionTo={Permission.DATA_ENTITY_STATUS_UPDATE}
            renderContent={({ isAllowedTo }) => (
              <EntityStatus
                entityStatus={status}
                selectable={isAllowedTo}
                isPropagatable={isDEG}
              />
            )}
          />
          {manuallyCreated && !isStatusDeleted && (
            <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_UPDATE}>
              <DataEntityGroupForm
                btnCreateEl={
                  <Button buttonType='secondary-lg' text='Edit group' sx={{ ml: 2 }} />
                }
              />
            </WithPermissions>
          )}
          <WithFeature featureName={Feature.DATA_COLLABORATION}>
            <CreateMessageForm
              dataEntityId={dataEntityId}
              btnCreateEl={
                <Button
                  text='Share'
                  buttonType='secondary-lg'
                  startIcon={<SlackIcon />}
                  sx={{ ml: 2 }}
                />
              }
            />
          </WithFeature>
        </Grid>
      </Grid>
      {originalName}
    </Grid>
  );
};

export default DataEntityDetailsHeader;
