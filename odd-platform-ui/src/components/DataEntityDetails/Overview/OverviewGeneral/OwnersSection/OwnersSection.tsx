import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, LabeledInfoItem, LabelItem } from 'components/shared/elements';
import { AddIcon, EditIcon } from 'components/shared/icons';
import { useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityOwnership,
  getIsDataEntityBelongsToClass,
  getIsEntityStatusDeleted,
} from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useTranslation } from 'react-i18next';
import OwnershipDeleteForm from './OwnershipDeleteForm/OwnershipDeleteForm';
import * as S from './OwnersSectionStyles';
import OwnershipForm from './OwnershipForm/OwnershipForm';

const OwnersSection: FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useAppParams();

  const ownership = useAppSelector(getDataEntityOwnership(dataEntityId));
  const { isDEG } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  return (
    <Grid item sm={12} sx={{ mt: 2 }}>
      <LabeledInfoItem label={t('Owners')}>
        {ownership?.length ? (
          ownership?.map(ownershipItem => (
            <S.OwnerItem key={ownershipItem.id}>
              <Typography variant='body1' noWrap>
                {ownershipItem.owner.name}
              </Typography>
              <LabelItem
                labelName={ownershipItem.title?.name}
                sx={{ flexShrink: 0, ml: 1 }}
              />
              <S.OwnerActionBtns>
                <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_UPDATE}>
                  {!isStatusDeleted && (
                    <OwnershipForm
                      dataEntityId={dataEntityId}
                      dataEntityOwnership={ownershipItem}
                      isDEG={isDEG}
                      ownerEditBtn={
                        <Button
                          buttonType='tertiary-m'
                          icon={<EditIcon />}
                          sx={{ ml: 1 }}
                        />
                      }
                    />
                  )}
                </WithPermissions>
                <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_DELETE}>
                  {!isStatusDeleted && (
                    <OwnershipDeleteForm
                      ownerName={ownershipItem.owner.name}
                      ownershipId={ownershipItem.id}
                      dataEntityId={dataEntityId}
                      isDEG={isDEG}
                    />
                  )}
                </WithPermissions>
              </S.OwnerActionBtns>
            </S.OwnerItem>
          ))
        ) : (
          <Typography variant='subtitle2'>{t('Not created')}.</Typography>
        )}
        <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_CREATE}>
          {!isStatusDeleted && (
            <OwnershipForm
              dataEntityId={dataEntityId}
              isDEG={isDEG}
              ownerEditBtn={
                <Button
                  text={t('Add Owner')}
                  data-qa='add_owner'
                  sx={{ mt: 0.25 }}
                  buttonType='tertiary-m'
                  startIcon={<AddIcon />}
                />
              }
            />
          )}
        </WithPermissions>
      </LabeledInfoItem>
    </Grid>
  );
};

export default OwnersSection;
