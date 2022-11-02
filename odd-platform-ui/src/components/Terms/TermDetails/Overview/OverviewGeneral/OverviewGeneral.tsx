import React from 'react';
import { Grid } from '@mui/material';
import { format } from 'date-fns';
import {
  AppButton,
  AppIconButton,
  ConfirmationDialog,
  LabeledInfoItem,
  LabelItem,
} from 'components/shared';
import { AddIcon, DeleteIcon, EditIcon } from 'components/shared/Icons';
import { deleteTermOwnership } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors/terms.selectors';
import { getTermOwnership } from 'redux/selectors';
import { WithPermissions } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import OwnershipForm from '../../Ownership/OwnershipForm';
import { OwnerActionBtns, OwnerItem } from './OverviewGeneralStyles';

const OverviewGeneral: React.FC = () => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

  const termDetails = useAppSelector(getTermDetails(termId));
  const ownership = useAppSelector(state => getTermOwnership(state, termId));

  const handleOwnershipDelete = (ownershipId: number) => () =>
    dispatch(deleteTermOwnership({ termId, ownershipId }));

  const createdAt = termDetails.createdAt && format(termDetails.createdAt, 'd MMM yyyy');

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label='Namespace' labelWidth={4}>
            {termDetails.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label='Created' labelWidth={4}>
            {createdAt}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem label='Owners'>
            {ownership?.map(ownershipItem => (
              <OwnerItem key={ownershipItem.id}>
                {ownershipItem.owner.name}
                <LabelItem labelName={ownershipItem.title?.name} />
                <OwnerActionBtns>
                  <WithPermissions
                    resourceId={termId}
                    resourceType={PermissionResourceType.TERM}
                    permissionTo={Permission.TERM_OWNERSHIP_UPDATE}
                  >
                    <OwnershipForm
                      termDetailsOwnership={ownershipItem}
                      ownerEditBtn={
                        <AppIconButton
                          size='small'
                          color='tertiary'
                          icon={<EditIcon />}
                          sx={{ ml: 1 }}
                        />
                      }
                    />
                  </WithPermissions>
                  <WithPermissions
                    resourceId={termId}
                    resourceType={PermissionResourceType.TERM}
                    permissionTo={Permission.TERM_OWNERSHIP_DELETE}
                  >
                    <ConfirmationDialog
                      actionTitle='Are you sure you want to delete this owner?'
                      actionName='Delete Owner'
                      actionText={
                        <>
                          &quot;{ownershipItem.owner.name}&quot; will be deleted
                          permanently.
                        </>
                      }
                      onConfirm={handleOwnershipDelete(ownershipItem.id)}
                      actionBtn={
                        <AppIconButton
                          size='small'
                          color='tertiary'
                          icon={<DeleteIcon />}
                          sx={{ ml: 0.5 }}
                        />
                      }
                    />
                  </WithPermissions>
                </OwnerActionBtns>
              </OwnerItem>
            ))}
            <WithPermissions
              permissionTo={Permission.TERM_OWNERSHIP_CREATE}
              resourceId={termId}
              resourceType={PermissionResourceType.TERM}
            >
              <OwnershipForm
                ownerEditBtn={
                  <AppButton
                    sx={{ mt: 0.25 }}
                    size='medium'
                    color='tertiary'
                    startIcon={<AddIcon />}
                  >
                    Add Owner
                  </AppButton>
                }
              />
            </WithPermissions>
          </LabeledInfoItem>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewGeneral;
