import React, { type FC, useState } from 'react';
import { FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { deleteDataEntityOwnership } from 'redux/thunks';

interface OwnershipDeleteFormProps {
  ownerName: string;
  ownershipId: number;
  dataEntityId: number;
  isDEG: boolean;
}

const OwnershipDeleteForm: FC<OwnershipDeleteFormProps> = ({
  ownerName,
  ownershipId,
  dataEntityId,
  isDEG,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [propagate, setPropagate] = useState(false);

  const handleOwnershipDelete = () =>
    dispatch(deleteDataEntityOwnership({ dataEntityId, ownershipId, propagate }));

  return (
    <ConfirmationDialog
      actionTitle={t('Are you sure you want to delete this owner?')}
      actionName={t('Delete Owner')}
      actionText={
        <>
          &quot;{ownerName}&quot; {t('will be deleted permanently')}.
        </>
      }
      onConfirm={handleOwnershipDelete}
      actionBtn={
        <Button buttonType='tertiary-m' icon={<DeleteIcon />} sx={{ ml: 0.5 }} />
      }
      additionalContent={
        isDEG ? (
          <FormControlLabel
            sx={{ ml: -0.25, mt: 1, mr: 0, alignItems: 'flex-start' }}
            checked={propagate}
            control={<Checkbox sx={{ mr: 1 }} />}
            onChange={() => setPropagate(prev => !prev)}
            label={t('Remove the owner binding in the nested entities')}
          />
        ) : null
      }
    />
  );
};

export default OwnershipDeleteForm;
