import React, { type FC } from 'react';
import { Typography } from '@mui/material';
import { AppMenu, AppMenuItem, Button } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppParams, useGetUploadOptions } from 'lib/hooks';
import SaveLinksForm from '../SaveLinksForm/SaveLinksForm';
import SaveFilesForm from '../SaveFilesForm/SaveFilesForm';
import * as S from './AttachmentsHeader.styles';

const AttachmentsHeader: FC = () => {
  const { dataEntityId } = useAppParams();
  const { data } = useGetUploadOptions({ dataEntityId });

  const menuId = 'add-attachments-menu';
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <S.Header>
      <Typography variant='h2'>Attachments</Typography>
      <WithPermissions permissionTo={Permission.DATA_ENTITY_ATTACHMENT_MANAGE}>
        <Button
          text='Add attachments'
          buttonType='secondary-lg'
          startIcon={<AddIcon />}
          aria-label={menuId}
          aria-controls={menuId}
          aria-haspopup='true'
          onClick={handleMenuOpen}
        />
      </WithPermissions>
      <AppMenu
        PaperProps={{ sx: { borderRadius: 2, width: anchorEl?.offsetWidth } }}
        MenuListProps={{ sx: { p: 1 } }}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: -35, horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <SaveLinksForm openBtn={<AppMenuItem>Add links</AppMenuItem>} />
        <SaveFilesForm
          openBtn={<AppMenuItem>Add file</AppMenuItem>}
          maxSize={data?.maxSize}
        />
      </AppMenu>
    </S.Header>
  );
};

export default AttachmentsHeader;
