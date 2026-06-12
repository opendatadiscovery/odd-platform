import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type Owner, Permission } from 'generated-sources';
import { Button, ConfirmationDialog, OwnerRoleCell } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { deleteOwner } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import * as S from './EditableOwnerItemStyles';
import OwnerForm from '../OwnerForm/OwnerForm';

interface EditableOwnerItemProps {
  ownerId: Owner['id'];
  name: Owner['name'];
  roles?: Owner['roles'];
}

const EditableOwnerItem: React.FC<EditableOwnerItemProps> = ({
  ownerId,
  name,
  roles,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDelete = React.useCallback(
    () => dispatch(deleteOwner({ ownerId })),
    [ownerId, deleteOwner]
  );

  return (
    <S.Container container>
      <Grid item lg={4}>
        <Typography variant='body1'>{name}</Typography>
      </Grid>
      <Grid item lg={6}>
        <OwnerRoleCell roles={roles} />
      </Grid>
      <S.ActionsContainer container item lg={2}>
        <WithPermissions permissionTo={Permission.OWNER_UPDATE}>
          <OwnerForm
            ownerId={ownerId}
            name={name}
            roles={roles}
            btnCreateEl={
              <Button
                text={t('Edit')}
                buttonType='secondary-m'
                startIcon={<EditIcon />}
              />
            }
          />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.OWNER_DELETE}>
          <ConfirmationDialog
            actionTitle={t('Are you sure you want to delete this owner?')}
            actionName={t('Delete Owner')}
            actionText={
              <>
                &quot;{name}&quot; {t('will be deleted permanently')}
              </>
            }
            onConfirm={handleDelete}
            actionBtn={
              <Button
                text={t('Delete')}
                buttonType='secondary-m'
                startIcon={<DeleteIcon />}
                sx={{ ml: 1 }}
              />
            }
          />
        </WithPermissions>
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableOwnerItem;
