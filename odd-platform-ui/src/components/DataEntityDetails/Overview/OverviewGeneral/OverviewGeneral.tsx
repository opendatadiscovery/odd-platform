import React from 'react';
import { Grid } from '@material-ui/core';
import { format } from 'date-fns';
import {
  DataEntityDetails,
  Ownership,
  DataEntityApiDeleteOwnershipRequest,
} from 'generated-sources';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppButton from 'components/shared/AppButton/AppButton';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
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
      <Grid
        item
        container
        sm={12}
        spacing={2}
        className={classes.container}
      >
        <Grid item sm={12} className={classes.generalItem}>
          <LabeledInfoItem inline label="Namespace" labelWidth={4}>
            {dataEntityDetails.dataSource.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} className={classes.generalItem}>
          <LabeledInfoItem inline label="Datasource" labelWidth={4}>
            {dataEntityDetails.dataSource?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} className={classes.generalItem}>
          <LabeledInfoItem inline label="Created" labelWidth={4}>
            {dataEntityDetails.createdAt
              ? format(dataEntityDetails.createdAt, 'd MMM yyyy')
              : null}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} className={classes.generalItem}>
          <LabeledInfoItem inline label="View count" labelWidth={4}>
            {dataEntityDetails.viewCount}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
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
                    <AppButton
                      className={classes.ownerActionBtns}
                      size="small"
                      color="tertiary"
                      icon={<EditIcon />}
                      onClick={() => {}}
                    />
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
                    <AppButton
                      className={classes.ownerActionBtns}
                      size="small"
                      color="tertiary"
                      icon={<DeleteIcon />}
                      onClick={() => {}}
                    />
                  }
                />
              </span>
            ))}
            <OwnershipFormContainer
              dataEntityId={dataEntityDetails.id}
              ownerEditBtn={
                <AppButton
                  className={classes.addOwnerBtn}
                  size="small"
                  color="tertiary"
                  icon={<AddIcon />}
                  onClick={() => {}}
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
