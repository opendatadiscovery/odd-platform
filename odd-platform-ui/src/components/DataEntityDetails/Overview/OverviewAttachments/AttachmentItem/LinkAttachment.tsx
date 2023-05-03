import React, { type FC, memo } from 'react';
import type { DataEntityLink } from 'generated-sources';
import { Link } from 'react-router-dom';
import { DeleteIcon, EditIcon, LinkIcon } from 'components/shared/icons';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { useAppParams, useDeleteDataEntityLink } from 'lib/hooks';
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
    <Link to={url} target='_blank'>
      <S.Container>
        <S.ActionsContainer>
          <EditLinkForm
            linkId={linkId}
            name={name}
            url={url}
            openBtn={<Button buttonType='linkGray-m-icon' icon={<EditIcon />} />}
          />
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this link?'
            actionName='Delete link'
            actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
            onConfirm={() => deleteLink({ dataEntityId, linkId })}
            actionBtn={<Button buttonType='linkGray-m-icon' icon={<DeleteIcon />} />}
          />
        </S.ActionsContainer>
        <S.IconContainer>
          <LinkIcon width={24} height={24} />
        </S.IconContainer>
        <S.NameContainer variant='h5'>{name}</S.NameContainer>
      </S.Container>
    </Link>
  );
};

export default memo(LinkAttachment);
