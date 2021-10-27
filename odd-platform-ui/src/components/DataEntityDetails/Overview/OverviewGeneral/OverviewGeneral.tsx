import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import {
  DataEntityApiDeleteOwnershipRequest,
  DataEntityDetails,
  Ownership,
} from 'generated-sources';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { StylesType } from './OverviewGeneralStyles';
import OwnershipFormContainer from '../../Ownership/OwnershipFormContainer';

interface OverviewGeneralProps extends StylesType {
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  ownership: Ownership[];
  deleteDataEntityOwnership: (
    params: DataEntityApiDeleteOwnershipRequest
  ) => Promise<void>;
}

const OverviewGeneral: React.FC<OverviewGeneralProps> = ({
  classes,
  dataEntityId,
  dataEntityDetails,
  ownership,
  deleteDataEntityOwnership,
}) => {
  const handleOwnershipDelete = (ownershipId: number) => () =>
    deleteDataEntityOwnership({ dataEntityId, ownershipId });

  return (
    <Grid container>
      <Grid item container sm={12} className={classes.container}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Namespace" labelWidth={4}>
            {dataEntityDetails.dataSource.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Datasource" labelWidth={4}>
            {dataEntityDetails.dataSource?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Created" labelWidth={4}>
            {dataEntityDetails.createdAt
              ? format(dataEntityDetails.createdAt, 'd MMM yyyy')
              : null}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="View count" labelWidth={4}>
            {dataEntityDetails.viewCount}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} className={classes.ownersContainer}>
          <LabeledInfoItem
            label="Owners"
            classes={{
              value: classes.ownershipList,
            }}
          >
            {ownership?.map(ownershipItem => (
              <span key={ownershipItem.id} className={classes.ownerItem}>
                {ownershipItem.owner.name}
                <span className={classes.ownerRole}>
                  {ownershipItem.role?.name}
                </span>
                <OwnershipFormContainer
                  dataEntityId={dataEntityDetails.id}
                  dataEntityOwnership={ownershipItem}
                  ownerEditBtn={
                    <div className={classes.ownerActionBtns}>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                      />
                    </div>
                  }
                />
                <ConfirmationDialog
                  actionTitle="Are you sure you want to delete this owner?"
                  actionName="Delete Owner"
                  actionText={
                    <>
                      &quot;{ownershipItem.owner.name}&quot; will be
                      deleted permanently.
                    </>
                  }
                  onConfirm={handleOwnershipDelete(ownershipItem.id)}
                  actionBtn={
                    <div className={classes.ownerActionBtns}>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<DeleteIcon />}
                        sx={{ ml: 0.5 }}
                      />
                    </div>
                  }
                />
              </span>
            ))}
            <OwnershipFormContainer
              dataEntityId={dataEntityDetails.id}
              ownerEditBtn={
                <AppButton
                  sx={{ mt: 0.25 }}
                  size="medium"
                  color="tertiary"
                  startIcon={<AddIcon />}
                >
                  Add Owner
                </AppButton>
              }
            />
          </LabeledInfoItem>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewGeneral;
