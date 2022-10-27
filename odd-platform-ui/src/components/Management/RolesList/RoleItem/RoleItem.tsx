import React from 'react';
import { Grid, Typography } from '@mui/material';
import { deleteRole } from 'redux/thunks';
import { Permission, Role } from 'generated-sources';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { DeleteIcon, EditIcon } from 'components/shared/Icons';
import { useAppDispatch } from 'redux/lib/hooks';
import TruncateMarkup from 'react-truncate-markup';
import { WithPermissions } from 'components/shared/contexts';
import RoleForm from '../RoleForm/RoleForm';
import * as S from './RoleItemStyles';

interface RoleItemProps {
  roleId: Role['id'];
  name: Role['name'];
  policies: Role['policies'];
}

const RoleItem: React.FC<RoleItemProps> = ({ roleId, name, policies }) => {
  const dispatch = useAppDispatch();

  const isUser = name === 'User';
  const isAdministrator = name === 'Administrator';

  const handleDelete = React.useCallback(
    () => dispatch(deleteRole({ roleId })),
    [roleId, deleteRole]
  );

  return (
    <S.Container container>
      <Grid item lg={3.53}>
        <Typography variant='body1' noWrap title={name}>
          {name}
        </Typography>
      </Grid>
      <Grid item container lg={6.73} flexWrap='nowrap'>
        <TruncateMarkup lines={1} tokenize='words'>
          <div style={{ display: 'flex' }}>
            {policies.map((policy, idx) => (
              <TruncateMarkup.Atom key={policy.id}>
                <Typography variant='body1'>
                  {`${idx ? ', ' : ''} ${policy.name}`}
                </Typography>
              </TruncateMarkup.Atom>
            ))}
          </div>
        </TruncateMarkup>
      </Grid>
      <Grid item lg={1.74}>
        <S.ActionsContainer container item>
          <WithPermissions
            permissionTo={Permission.ROLE_UPDATE}
            extraCheck={!isAdministrator}
          >
            <RoleForm
              roleId={roleId}
              name={name}
              policies={policies}
              openBtn={
                <AppButton
                  size='medium'
                  color='primaryLight'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                >
                  Edit
                </AppButton>
              }
            />
          </WithPermissions>
          <WithPermissions
            permissionTo={Permission.ROLE_DELETE}
            extraCheck={!(isUser || isAdministrator)}
          >
            <ConfirmationDialog
              actionTitle='Are you sure you want to delete this role?'
              actionName='Delete Role'
              actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
              onConfirm={handleDelete}
              actionBtn={
                <AppButton size='medium' color='primaryLight' startIcon={<DeleteIcon />}>
                  Delete
                </AppButton>
              }
            />
          </WithPermissions>
        </S.ActionsContainer>
      </Grid>
    </S.Container>
  );
};

export default RoleItem;
