import React, { type FC } from 'react';
import type { DataEntityLink } from 'generated-sources';
import { Permission } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, DocumentIcon, ImageIcon } from 'components/shared/icons';
import {
  useAppParams,
  useDeleteDataEntityFile,
  useDownloadDataEntityFile,
} from 'lib/hooks';
import { isImageFile } from 'lib/helpers';
import { WithPermissions } from 'components/shared/contexts';
import * as S from './AttachmentItem.styles';

interface FileAttachmentProps {
  fileId: DataEntityLink['id'];
  name: DataEntityLink['name'];
}

const FileAttachment: FC<FileAttachmentProps> = ({ fileId, name }) => {
  const { dataEntityId } = useAppParams();
  const { mutateAsync: deleteFile } = useDeleteDataEntityFile();
  const { refetch: downloadFile } = useDownloadDataEntityFile({ dataEntityId, fileId });

  const handleFileDownload = () => {
    downloadFile().then(({ data: file }) => {
      const link = document.createElement('a');

      if (file) {
        link.href = window.URL.createObjectURL(file);
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      }
    });
  };

  return (
    <S.Container onClick={handleFileDownload}>
      <S.ActionsContainer>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_ATTACHMENT_MANAGE}>
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this file?'
            actionName='Delete file'
            actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
            onConfirm={() => deleteFile({ dataEntityId, fileId })}
            actionBtn={<Button buttonType='linkGray-m-icon' icon={<DeleteIcon />} />}
          />
        </WithPermissions>
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
