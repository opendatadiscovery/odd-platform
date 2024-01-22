import type { FC } from 'react';
import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type Collector, Permission } from 'generated-sources';
import { deleteCollector } from 'redux/thunks';
import {
  Button,
  ConfirmationDialog,
  InfoItem,
  LabeledInfoItem,
} from 'components/shared/elements';
import { AlertIcon, DeleteIcon, EditIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import CollectorFormDialog from '../CollectorForm/CollectorForm';
import CollectorItemToken from './CollectorItemToken/CollectorItemToken';
import * as S from './CollectorItemStyles';

interface CollectorItemProps {
  collector: Collector;
}

const CollectorItem: FC<CollectorItemProps> = ({ collector }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [isHidden, setIsHidden] = useState(true);

  const onDelete = () => dispatch(deleteCollector({ collectorId: collector.id }));

  return (
    <S.Container elevation={0}>
      <S.Header>
        <Typography variant='h4' title={collector.name}>
          {collector.name}
        </Typography>
        <S.Actions>
          <WithPermissions permissionTo={Permission.COLLECTOR_UPDATE}>
            <CollectorFormDialog
              collector={collector}
              btnCreateEl={
                <Button
                  text={t('Edit')}
                  buttonType='secondary-m'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                />
              }
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.COLLECTOR_DELETE}>
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this collector?')}
              actionName={t('Delete')}
              actionText={
                <Typography variant='subtitle1'>
                  {t('Delete')} &quot;{collector.name}&quot; {t('collector')}?
                </Typography>
              }
              onConfirm={onDelete}
              actionBtn={
                <Button
                  text={t('Delete')}
                  buttonType='secondary-m'
                  startIcon={<DeleteIcon />}
                />
              }
            />
          </WithPermissions>
        </S.Actions>
      </S.Header>
      <S.Description>
        <LabeledInfoItem variant='body2' inline label={t('Description')} labelWidth={4}>
          {collector.description}
        </LabeledInfoItem>
        <LabeledInfoItem variant='body2' inline label={t('Namespace')} labelWidth={4}>
          {collector.namespace?.name}
        </LabeledInfoItem>
        <LabeledInfoItem variant='body2' inline label={t('Token')} labelWidth={4}>
          <CollectorItemToken
            collector={collector}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
          />
        </LabeledInfoItem>
        {!isHidden && (
          <InfoItem
            sx={{ p: 1, backgroundColor: 'warning.light', borderRadius: 1 }}
            label={<AlertIcon fill='#E59900' width={24} height={24} />}
            info={
              <Typography variant='body1'>
                Save token in a secure location. You will not be able to retrieve it
                again.
              </Typography>
            }
          />
        )}
      </S.Description>
    </S.Container>
  );
};

export default CollectorItem;
