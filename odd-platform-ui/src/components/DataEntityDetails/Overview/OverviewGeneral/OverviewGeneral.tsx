import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import {
  AppButton,
  AppIconButton,
  ConfirmationDialog,
  CopyButton,
  LabeledInfoItem,
  LabelItem,
} from 'components/shared';
import { AddIcon, DeleteIcon, EditIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { deleteDataEntityOwnership } from 'redux/thunks';
import {
  getDataEntityDetails,
  getDataEntityOwnership,
} from 'redux/selectors';
import { useAppParams, usePermissions } from 'lib/hooks';
import * as S from './OverviewGeneralStyles';
import OwnershipForm from '../../Ownership/OwnershipForm';

const OverviewGeneral: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { isAdmin } = usePermissions({ dataEntityId });

  const dataEntityDetails = useAppSelector(
    getDataEntityDetails(dataEntityId)
  );
  const ownership = useAppSelector(getDataEntityOwnership(dataEntityId));

  const handleOwnershipDelete = (ownershipId: number) => () =>
    dispatch(deleteDataEntityOwnership({ dataEntityId, ownershipId }));

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Namespace" labelWidth={4}>
            {dataEntityDetails.dataSource.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        {!dataEntityDetails?.manuallyCreated && (
          <Grid item sm={12}>
            <LabeledInfoItem inline label="Datasource" labelWidth={4}>
              {dataEntityDetails.dataSource?.name}
            </LabeledInfoItem>
          </Grid>
        )}
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
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem
            labelWidth={12}
            label={
              <Grid container justifyContent="space-between">
                <Grid item>ODDRN</Grid>
                <Grid item>
                  <CopyButton
                    text="Copy"
                    stringToCopy={dataEntityDetails.oddrn}
                  />
                </Grid>
              </Grid>
            }
          >
            <S.OddrnValue>{dataEntityDetails.oddrn}</S.OddrnValue>
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem label="Owners">
            {ownership?.map(ownershipItem => (
              <S.OwnerItem key={ownershipItem.id}>
                {ownershipItem.owner.name}
                <LabelItem labelName={ownershipItem.role?.name} />
                <S.OwnerActionBtns>
                  <OwnershipForm
                    dataEntityId={dataEntityDetails.id}
                    dataEntityOwnership={ownershipItem}
                    ownerEditBtn={
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                        disabled={!isAdmin}
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
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<DeleteIcon />}
                        sx={{ ml: 0.5 }}
                        disabled={!isAdmin}
                      />
                    }
                  />
                </S.OwnerActionBtns>
              </S.OwnerItem>
            ))}
            <OwnershipForm
              dataEntityId={dataEntityDetails.id}
              ownerEditBtn={
                <AppButton
                  sx={{ mt: 0.25 }}
                  size="medium"
                  color="tertiary"
                  startIcon={<AddIcon />}
                  disabled={!isAdmin}
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
