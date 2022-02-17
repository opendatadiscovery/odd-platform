import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Owner, OwnerApiDeleteOwnerRequest } from 'generated-sources';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import OwnerFormContainer from 'components/Management/OwnersList/OwnerForm/OwnerFormContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from './EditableOwnerItemStyles';

interface EditableOwnerItemProps {
  owner: Owner;
  deleteOwner: (params: OwnerApiDeleteOwnerRequest) => Promise<void>;
}

const EditableOwnerItem: React.FC<EditableOwnerItemProps> = ({
  owner,
  deleteOwner,
}) => {
  const handleDelete = React.useCallback(
    () => deleteOwner({ ownerId: owner.id }),
    [owner, deleteOwner]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant="body1" noWrap title={owner.name}>
          {owner.name}
        </Typography>
      </Grid>
      <S.ActionsContainer item>
        <OwnerFormContainer
          owner={owner}
          btnCreateEl={
            <AppButton
              color="primaryLight"
              size="medium"
              startIcon={<EditIcon />}
              sx={{ mr: 0.5 }}
            >
              Edit
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle="Are you sure you want to delete this owner?"
          actionName="Delete Owner"
          actionText={
            <>&quot;{owner.name}&quot; will be deleted permanently.</>
          }
          onConfirm={handleDelete}
          actionBtn={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<DeleteIcon />}
              sx={{ ml: 1 }}
            >
              Delete
            </AppButton>
          }
        />
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableOwnerItem;
