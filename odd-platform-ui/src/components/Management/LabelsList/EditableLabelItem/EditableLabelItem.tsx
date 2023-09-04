import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Label, Permission } from 'generated-sources';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { deleteLabel } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { useTranslation } from 'react-i18next';
import LabelEditForm from '../LabelEditForm/LabelEditForm';
import * as S from './EditableLabelItemStyles';

interface EditableLabelItemProps {
  label: Label;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({ label }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDelete = React.useCallback(
    () => dispatch(deleteLabel({ labelId: label.id })),
    [label, deleteLabel]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant='body1' noWrap title={label.name}>
          {label.name}
        </Typography>
      </Grid>
      {!label.external && (
        <S.ActionsContainer item>
          <WithPermissions permissionTo={Permission.LABEL_UPDATE}>
            <LabelEditForm
              label={label}
              editBtn={
                <Button
                  text={t('Edit')}
                  buttonType='secondary-m'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                />
              }
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.LABEL_DELETE}>
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this label?')}
              actionName={t('Delete Label')}
              actionText={
                <>
                  &quot;{label.name}&quot; {t('will be deleted permanently')}
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
      )}
    </S.Container>
  );
};

export default EditableLabelItem;
