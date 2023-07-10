import React, { type FC, memo } from 'react';
import { Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { AddIcon, EditIcon } from 'components/shared/icons';
import * as S from './InternalDescriptionHeader.styles';

interface InternalDescriptionHeaderProps {
  toggleEditMode: () => void;
  isDescriptionEmpty: boolean;
}

const InternalDescriptionHeader: FC<InternalDescriptionHeaderProps> = ({
  toggleEditMode,
  isDescriptionEmpty,
}) => (
  <S.CaptionContainer>
    <Typography variant='h2'>About</Typography>
    <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
      <Button
        text={isDescriptionEmpty ? 'Add info' : 'Edit info'}
        data-qa='add_description'
        onClick={toggleEditMode}
        buttonType='secondary-lg'
        startIcon={isDescriptionEmpty ? <AddIcon /> : <EditIcon />}
      />
    </WithPermissions>
  </S.CaptionContainer>
);

export default memo(InternalDescriptionHeader);
