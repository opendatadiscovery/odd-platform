import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { AddIcon, EditIcon } from 'components/shared/icons';
import * as S from './InternalDescriptionHeader.styles';

interface InternalDescriptionHeaderProps {
  handleEditClick: () => void;
  isDescriptionEmpty: boolean;
}

// TODO check re-renders, memo if needed
const InternalDescriptionHeader: FC<InternalDescriptionHeaderProps> = ({
  handleEditClick,
  isDescriptionEmpty,
}) => (
  <S.CaptionContainer>
    <Typography variant='h2'>About</Typography>
    <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
      <Button
        text={isDescriptionEmpty ? 'Add info' : 'Edit info'}
        data-qa='add_description'
        onClick={handleEditClick}
        buttonType='secondary-lg'
        startIcon={isDescriptionEmpty ? <AddIcon /> : <EditIcon />}
      />
    </WithPermissions>
  </S.CaptionContainer>
);

export default InternalDescriptionHeader;
