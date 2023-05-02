import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataEntityAttachmentApi } from 'lib/api';
import type {
  DataEntityAttachmentApiGetAttachmentsRequest,
  DataEntityAttachmentApiSaveLinksRequest,
  DataEntityAttachmentApiUpdateLinkRequest,
  DataEntityAttachmentApiDeleteLinkRequest,
  DataEntityAttachmentApiSaveFilesRequest,
  DataEntityAttachmentApiDownloadFileRequest,
  DataEntityAttachmentApiDeleteFileRequest,
} from 'generated-sources';
import { showSuccessToast } from 'lib/errorHandling';

export function useDataEntityAttachments({
  dataEntityId,
}: DataEntityAttachmentApiGetAttachmentsRequest) {
  return useQuery(['dataEntityAttachments'], () =>
    dataEntityAttachmentApi.getAttachments({ dataEntityId })
  );
}

export function useSaveDataEntityLinks() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiSaveLinksRequest) =>
      dataEntityAttachmentApi.saveLinks(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Links successfully saved!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useUpdateDataEntityLink() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiUpdateLinkRequest) =>
      dataEntityAttachmentApi.updateLink(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Link successfully updated!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useDeleteDataEntityLink() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiDeleteLinkRequest) =>
      dataEntityAttachmentApi.deleteLink(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Link successfully deleted!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useSaveDataEntityFiles() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiSaveFilesRequest) =>
      dataEntityAttachmentApi.saveFiles(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Files successfully saved!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useDownloadDataEntityFile({
  dataEntityId,
  fileId,
}: DataEntityAttachmentApiDownloadFileRequest) {
  return useQuery(['dataEntityFiles', dataEntityId, fileId], () =>
    dataEntityAttachmentApi.downloadFile({ dataEntityId, fileId })
  );
}

export function useDeleteDataEntityFile() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiDeleteFileRequest) =>
      dataEntityAttachmentApi.deleteFile(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Files successfully deleted!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}
