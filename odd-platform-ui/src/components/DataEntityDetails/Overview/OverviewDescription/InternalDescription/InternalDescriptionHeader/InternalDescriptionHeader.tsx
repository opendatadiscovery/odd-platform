import React, { type FC, memo } from 'react';
import { Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { AppTooltip, Button } from 'components/shared/elements';
import { AddIcon, EditIcon, InformationIcon } from 'components/shared/icons';
import * as S from './InternalDescriptionHeader.styles';

interface InternalDescriptionHeaderProps {
  toggleEditMode: () => void;
  isDescriptionEmpty: boolean;
}

const InternalDescriptionHeader: FC<InternalDescriptionHeaderProps> = ({
  toggleEditMode,
  isDescriptionEmpty,
}) => {
  const tooltipInfoContent = (
    <S.Tooltip>
      You can link an existing term by entering information about the term according to
      the pattern [[NamespaceName:TermName]]
      <br />
      <br />
      <b>Example: This entity describes [[Finance:User]]</b>
    </S.Tooltip>
  );

  return (
    <S.CaptionContainer>
      <S.About>
        <Typography variant='h2' mr={1}>
          About
        </Typography>
        <AppTooltip title={tooltipInfoContent} checkForOverflow={false}>
          <InformationIcon width={14} height={14} />
        </AppTooltip>
      </S.About>
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
};

export default memo(InternalDescriptionHeader);
