import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Collector } from 'generated-sources';
import { deleteCollector } from 'redux/thunks';
import { useAppDispatch } from 'lib/redux/hooks';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import CollectorFormDialog from 'components/Management/CollectorsList/CollectorForm/CollectorForm';
import CollectorItemToken from './CollectorItemToken/CollectorItemToken';
import {
  CollectorActionsContainer,
  CollectorDescriptionContainer,
  CollectorContainer,
} from './CollectorItemStyles';

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
    <CollectorContainer elevation={0}>
      <Grid container alignItems="flex-start" spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h4" title={collector.name}>
            {collector.name}
          </Typography>
        </Grid>
        <CollectorActionsContainer item sm={4}>
          <CollectorFormDialog
            collector={collector}
            btnCreateEl={
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Edit
              </AppButton>
            }
          />
          <ConfirmationDialog
            actionTitle="Are you sure you want to delete this collector?"
            actionName="Delete"
            actionText={
              <Typography variant="subtitle1">
                Delete &quot;{collector.name}&quot; collector?
              </Typography>
            }
            onConfirm={onDelete}
            actionBtn={
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<DeleteIcon />}
              >
                Delete
              </AppButton>
            }
          />
        </CollectorActionsContainer>
        <CollectorDescriptionContainer item sm={6} container>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Description"
            labelWidth={4}
          >
            {collector.description}
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Namespace"
            labelWidth={4}
          >
            {collector.namespace?.name}
          </LabeledInfoItem>
          <LabeledInfoItem
            variant="body2"
            inline
            label="Token"
            labelWidth={4}
          >
            <CollectorItemToken collector={collector} />
          </LabeledInfoItem>
        </CollectorDescriptionContainer>
      </Grid>
    </CollectorContainer>
  );
};

export default CollectorItem;
