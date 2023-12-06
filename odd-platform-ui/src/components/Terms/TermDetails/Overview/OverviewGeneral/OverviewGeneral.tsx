import React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ConfirmationDialog,
  LabeledInfoItem,
  LabelItem,
} from 'components/shared/elements';
import { AddIcon, DeleteIcon, EditIcon } from 'components/shared/icons';
import { deleteTermOwnership } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppDateTime } from 'lib/hooks';
import { getTermDetails } from 'redux/selectors/terms.selectors';
import { getTermOwnership } from 'redux/selectors';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useTermsRouteParams } from 'routes';
import OwnershipForm from '../../Ownership/OwnershipForm';
import { OwnerActionBtns, OwnerItem } from './OverviewGeneralStyles';

const OverviewGeneral: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { termId } = useTermsRouteParams();
  const { termFormattedDateTime } = useAppDateTime();

  const termDetails = useAppSelector(getTermDetails(termId));
  const ownership = useAppSelector(state => getTermOwnership(state, termId));

  const handleOwnershipDelete = (ownershipId: number) => () =>
    dispatch(deleteTermOwnership({ termId, ownershipId }));

  const createdAt =
    termDetails.createdAt && termFormattedDateTime(termDetails.createdAt.getTime());

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Grid item sm={12}>
          <LabeledInfoItem inline label={t('Namespace')} labelWidth={4}>
            {termDetails.namespace?.name}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12}>
          <LabeledInfoItem inline label={t('Created')} labelWidth={4}>
            {createdAt}
          </LabeledInfoItem>
        </Grid>
        <Grid item sm={12} sx={{ mt: 2 }}>
          <LabeledInfoItem label={t('Owners')}>
            {ownership?.map(ownershipItem => (
              <OwnerItem key={ownershipItem.id}>
                {ownershipItem.owner.name}
                <LabelItem sx={{ ml: 0.5 }} labelName={ownershipItem.title?.name} />
                <OwnerActionBtns>
                  <WithPermissions permissionTo={Permission.TERM_OWNERSHIP_UPDATE}>
                    <OwnershipForm
                      termDetailsOwnership={ownershipItem}
                      ownerEditBtn={
                        <Button
                          buttonType='tertiary-m'
                          icon={<EditIcon />}
                          sx={{ ml: 1 }}
                        />
                      }
                    />
                  </WithPermissions>
                  <WithPermissions permissionTo={Permission.TERM_OWNERSHIP_DELETE}>
                    <ConfirmationDialog
                      actionTitle={t('Are you sure you want to delete this owner?')}
                      actionName={t('Delete Owner')}
                      actionText={
                        <>
                          &quot;{ownershipItem.owner.name}&quot;{' '}
                          {t('will be deleted permanently')}
                        </>
                      }
                      onConfirm={handleOwnershipDelete(ownershipItem.id)}
                      actionBtn={
                        <Button
                          buttonType='tertiary-m'
                          icon={<DeleteIcon />}
                          sx={{ ml: 0.5 }}
                        />
                      }
                    />
                  </WithPermissions>
                </OwnerActionBtns>
              </OwnerItem>
            ))}
            <WithPermissions permissionTo={Permission.TERM_OWNERSHIP_CREATE}>
              <OwnershipForm
                ownerEditBtn={
                  <Button
                    text={t('Add Owner')}
                    sx={{ mt: 0.25 }}
                    buttonType='tertiary-m'
                    startIcon={<AddIcon />}
                  />
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
