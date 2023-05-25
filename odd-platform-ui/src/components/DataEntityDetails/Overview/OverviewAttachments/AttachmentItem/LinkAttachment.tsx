import React, { type FC, memo } from 'react';
import type { DataEntityLink } from 'generated-sources';
import { Permission } from 'generated-sources';
import { DeleteIcon, EditIcon, LinkIcon } from 'components/shared/icons';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { useAppParams, useDeleteDataEntityLink } from 'lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import EditLinkForm from '../EditLinkForm/EditLinkForm';
import * as S from './AttachmentItem.styles';

interface LinkAttachmentProps {
  linkId: DataEntityLink['id'];
  name: DataEntityLink['name'];
  url: DataEntityLink['url'];
}

const LinkAttachment: FC<LinkAttachmentProps> = ({ name, linkId, url }) => {
  const { dataEntityId } = useAppParams();
  const { mutateAsync: deleteLink } = useDeleteDataEntityLink();

  return (
    <a href={url} target='_blank' rel='noreferrer'>
      <S.Container>
        <S.ActionsContainer>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_ATTACHMENT_MANAGE}>
            <EditLinkForm
              linkId={linkId}
              name={name}
              url={url}
              openBtn={<Button buttonType='linkGray-m-icon' icon={<EditIcon />} />}
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.DATA_ENTITY_ATTACHMENT_MANAGE}>
            <ConfirmationDialog
              actionTitle='Are you sure you want to delete this link?'
              actionName='Delete link'
              actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
              onConfirm={() => deleteLink({ dataEntityId, linkId })}
              actionBtn={<Button buttonType='linkGray-m-icon' icon={<DeleteIcon />} />}
            />
          </WithPermissions>
        </S.ActionsContainer>
        <S.IconContainer>
          <LinkIcon width={24} height={24} />
        </S.IconContainer>
        <S.NameContainer variant='h5'>{name}</S.NameContainer>
      </S.Container>
    </a>
  );
};

export default memo(LinkAttachment);
