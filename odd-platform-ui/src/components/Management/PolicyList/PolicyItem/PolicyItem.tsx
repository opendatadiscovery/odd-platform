import React from 'react';
import { Grid, Typography } from '@mui/material';
import { deletePolicy, deleteRole } from 'redux/thunks';
import { Permission, type Policy } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { useTranslation } from 'react-i18next';
import * as S from './PolicyItemStyles';

interface PolicyItemProps {
  policyId: Policy['id'];
  name: Policy['name'];
}

const PolicyItem: React.FC<PolicyItemProps> = ({ policyId, name }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { hasAccessTo } = usePermissions();

  const isAdministrator = name === 'Administrator';

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
          <Button
            text={
              isAdministrator || !hasAccessTo(Permission.POLICY_UPDATE)
                ? t('View')
                : t('Edit')
            }
            to={`${policyId}`}
            buttonType='secondary-m'
            startIcon={
              hasAccessTo(Permission.POLICY_UPDATE) && !isAdministrator && <EditIcon />
            }
            sx={{ mr: 1 }}
          />
          <WithPermissions
            permissionTo={Permission.POLICY_DELETE}
            extraCheck={!isAdministrator}
          >
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this policy?')}
              actionName={t('Delete Policy')}
              actionText={
                <>
                  &quot;{name}&quot; {t('will be deleted permanently')}.
                </>
              }
              onConfirm={handleDelete}
              actionBtn={
                <Button
                  text={t('Delete')}
                  buttonType='secondary-m'
                  startIcon={<DeleteIcon />}
                />
              }
            />
          </WithPermissions>
        </S.ActionsContainer>
      </Grid>
    </S.Container>
  );
};

export default PolicyItem;
