import React, { type FC } from 'react';
import type { DataEntityLink } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, DocumentIcon, ImageIcon } from 'components/shared/icons';
import { useAppParams, useDeleteDataEntityFile } from 'lib/hooks';
import { isImageFile } from 'lib/helpers';
import * as S from './AttachmentItem.styles';

interface FileAttachmentProps {
  fileId: DataEntityLink['id'];
  name: DataEntityLink['name'];
}

const FileAttachment: FC<FileAttachmentProps> = ({ fileId, name }) => {
  const { dataEntityId } = useAppParams();
  const { mutateAsync: deleteFile } = useDeleteDataEntityFile();

  return (
    <S.Container>
      <S.ActionsContainer>
        <ConfirmationDialog
          actionTitle='Are you sure you want to delete this file?'
          actionName='Delete file'
          actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
          onConfirm={() => deleteFile({ dataEntityId, fileId })}
          actionBtn={<Button buttonType='linkGray-m-icon' icon={<DeleteIcon />} />}
        />
      </S.ActionsContainer>
      <S.IconContainer>
        {isImageFile(name) ? (
          <ImageIcon width={24} height={24} />
        ) : (
          <DocumentIcon width={24} height={24} />
        )}
      </S.IconContainer>
      <S.NameContainer variant='h5'>{name}</S.NameContainer>
    </S.Container>
  );
};

export default FileAttachment;
