import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataEntityAttachmentApi } from 'lib/api';
import type {
  DataEntityAttachmentApiGetAttachmentsRequest,
  DataEntityAttachmentApiSaveLinksRequest,
  DataEntityAttachmentApiUpdateLinkRequest,
  DataEntityAttachmentApiDeleteLinkRequest,
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

// TODO check for design - link or links
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
