import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import EditIcon from 'components/shared/Icons/EditIcon';
import AddIcon from 'components/shared/Icons/AddIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import OwnershipForm from 'components/Terms/TermDetails/Ownership/OwnershipForm';
import { deleteTermOwnership } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors/terms.selectors';
import { getTermOwnership } from 'redux/selectors';
import { OwnerActionBtns, OwnerItem } from './OverviewGeneralStyles';

const OverviewGeneral: React.FC = () => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

  const termDetails = useAppSelector(state =>
    getTermDetails(state, termId)
  );

  const ownership = useAppSelector(state =>
    getTermOwnership(state, termId)
  );

  const handleOwnershipDelete = (ownershipId: number) => () =>
    dispatch(deleteTermOwnership({ termId, ownershipId }));

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Namespace" labelWidth={4}>
            {termDetails.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label="Created" labelWidth={4}>
            {termDetails.createdAt &&
              format(termDetails.createdAt, 'd MMM yyyy')}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem label="Owners">
            {ownership?.map(ownershipItem => (
              <OwnerItem key={ownershipItem.id}>
                {ownershipItem.owner.name}
                <LabelItem labelName={ownershipItem.role?.name} />
                <OwnershipForm
                  termDetailsOwnership={ownershipItem}
                  ownerEditBtn={
                    <OwnerActionBtns>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                      />
                    </OwnerActionBtns>
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
                    <OwnerActionBtns>
                      <AppIconButton
                        size="small"
                        color="tertiary"
                        icon={<DeleteIcon />}
                        sx={{ ml: 0.5 }}
                      />
                    </OwnerActionBtns>
                  }
                />
              </OwnerItem>
            ))}
            <OwnershipForm
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
