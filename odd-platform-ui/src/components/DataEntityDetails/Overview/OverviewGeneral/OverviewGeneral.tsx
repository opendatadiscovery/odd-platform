import React from 'react';
import { Grid, Typography } from '@mui/material';
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
import CopyIcon from 'components/shared/Icons/CopyIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import * as S from './OverviewGeneralStyles';
import OwnershipFormContainer from '../../Ownership/OwnershipFormContainer';

interface OverviewGeneralProps {
  dataEntityId: number;
  dataEntityDetails: DataEntityDetails;
  ownership: Ownership[];
  deleteDataEntityOwnership: (
    params: DataEntityApiDeleteOwnershipRequest
  ) => Promise<void>;
}

const OverviewGeneral: React.FC<OverviewGeneralProps> = ({
  dataEntityId,
  dataEntityDetails,
  ownership,
  deleteDataEntityOwnership,
}) => {
  const handleOwnershipDelete = (ownershipId: number) => () =>
    deleteDataEntityOwnership({ dataEntityId, ownershipId });

  const copyRef = React.createRef<HTMLElement>();
  return (
    <Grid container>
      <Grid item container sm={12}>
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
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem
            labelWidth={12}
            label={
              <Grid container justifyContent="space-between">
                <Grid item>ODDRN</Grid>
                <Grid item>
                  <CopyButton
                    copyString={dataEntityDetails.oddrn}
                    color="tertiary"
                    icon={<CopyIcon />}
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
                <OwnershipFormContainer
                  dataEntityId={dataEntityDetails.id}
                  dataEntityOwnership={ownershipItem}
                  ownerEditBtn={
                    <S.OwnerActionBtns>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                      />
                    </S.OwnerActionBtns>
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
                    <S.OwnerActionBtns>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<DeleteIcon />}
                        sx={{ ml: 0.5 }}
                      />
                    </S.OwnerActionBtns>
                  }
                />
              </S.OwnerItem>
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
