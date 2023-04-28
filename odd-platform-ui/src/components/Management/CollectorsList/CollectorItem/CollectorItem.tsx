import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Collector, Permission } from 'generated-sources';
import { deleteCollector } from 'redux/thunks';
import { Button, ConfirmationDialog, LabeledInfoItem } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import CollectorFormDialog from '../CollectorForm/CollectorForm';
import CollectorItemToken from './CollectorItemToken/CollectorItemToken';
import * as S from './CollectorItemStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItem: React.FC<CollectorItemProps> = ({ collector }) => {
  const dispatch = useAppDispatch();

  const onDelete = React.useCallback(
    () => dispatch(deleteCollector({ collectorId: collector.id })),
    [collector]
  );

  return (
    <S.CollectorContainer elevation={0}>
      <Grid container alignItems='flex-start' spacing={2}>
        <Grid item xs={8}>
          <Typography variant='h4' title={collector.name}>
            {collector.name}
          </Typography>
        </Grid>
        <S.CollectorActionsContainer item sm={4}>
          <WithPermissions permissionTo={Permission.COLLECTOR_UPDATE}>
            <CollectorFormDialog
              collector={collector}
              btnCreateEl={
                <Button
                  text='Edit'
                  buttonType='secondary-m'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                />
              }
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.COLLECTOR_DELETE}>
            <ConfirmationDialog
              actionTitle='Are you sure you want to delete this collector?'
              actionName='Delete'
              actionText={
                <Typography variant='subtitle1'>
                  Delete &quot;{collector.name}&quot; collector?
                </Typography>
              }
              onConfirm={onDelete}
              actionBtn={
                <Button
                  text='Delete'
                  buttonType='secondary-m'
                  startIcon={<DeleteIcon />}
                />
              }
            />
          </WithPermissions>
        </S.CollectorActionsContainer>
        <S.CollectorDescriptionContainer item sm={6} container>
          <LabeledInfoItem variant='body2' inline label='Description' labelWidth={4}>
            {collector.description}
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Namespace' labelWidth={4}>
            {collector.namespace?.name}
          </LabeledInfoItem>
          <LabeledInfoItem variant='body2' inline label='Token' labelWidth={4}>
            <CollectorItemToken collector={collector} />
          </LabeledInfoItem>
        </S.CollectorDescriptionContainer>
      </Grid>
    </S.CollectorContainer>
  );
};

export default CollectorItem;
