import React from 'react';
import { Grid, Typography } from '@mui/material';
import { deletePolicy, deleteRole } from 'redux/thunks';
import { Policy } from 'generated-sources';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { DeleteIcon, EditIcon } from 'components/shared/Icons';
import { useAppPaths, usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './PolicyItemStyles';

interface PolicyItemProps {
  policyId: Policy['id'];
  name: Policy['name'];
}

const PolicyItem: React.FC<PolicyItemProps> = ({ policyId, name }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const { policyDetailsPath } = useAppPaths();
  const policyDetailsLink = policyDetailsPath(policyId);

  const handleDelete = React.useCallback(
    () => dispatch(deletePolicy({ policyId })),
    [policyId, deleteRole]
  );

  return (
    <S.Container container>
      <Grid item lg={3.53}>
        <Typography variant='body1' noWrap title={name}>
          {name}
        </Typography>
      </Grid>
      <Grid item container lg={6.73} flexWrap='nowrap' />
      <Grid item lg={1.74}>
        <S.ActionsContainer container item>
          <AppButton
            to={policyDetailsLink}
            size='medium'
            color='primaryLight'
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            disabled={!isAdmin}
          >
            Edit
          </AppButton>
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this policy?'
            actionName='Delete Policy'
            actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
            onConfirm={handleDelete}
            actionBtn={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<DeleteIcon />}
                disabled={!isAdmin}
              >
                Delete
              </AppButton>
            }
          />
        </S.ActionsContainer>
      </Grid>
    </S.Container>
  );
};

export default PolicyItem;