import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { Button, LabeledInfoItem, LabelItem } from 'components/shared/elements';
import { AddIcon, EditIcon } from 'components/shared/icons';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityOwnership, getIsDataEntityBelongsToClass } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import OwnershipDeleteForm from './OwnershipDeleteForm/OwnershipDeleteForm';
import * as S from './OwnersSectionStyles';
import OwnershipForm from './OwnershipForm/OwnershipForm';

const OwnersSection: FC = () => {
  const { dataEntityId } = useAppParams();

  const ownership = useAppSelector(getDataEntityOwnership(dataEntityId));
  const { isDEG } = useAppSelector(getIsDataEntityBelongsToClass(dataEntityId));

  return (
    <Grid item sm={12} sx={{ mt: 2 }}>
      <LabeledInfoItem label='Owners'>
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
                </WithPermissions>
                <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_DELETE}>
                  <OwnershipDeleteForm
                    ownerName={ownershipItem.owner.name}
                    ownershipId={ownershipItem.id}
                    dataEntityId={dataEntityId}
                    isDEG={isDEG}
                  />
                </WithPermissions>
              </S.OwnerActionBtns>
            </S.OwnerItem>
          ))
        ) : (
          <Typography variant='subtitle2'>Not created.</Typography>
        )}
        <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_CREATE}>
          <OwnershipForm
            dataEntityId={dataEntityId}
            isDEG={isDEG}
            ownerEditBtn={
              <Button
                text='Add Owner'
                data-qa='add_owner'
                sx={{ mt: 0.25 }}
                buttonType='tertiary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </LabeledInfoItem>
    </Grid>
  );
};

export default OwnersSection;
