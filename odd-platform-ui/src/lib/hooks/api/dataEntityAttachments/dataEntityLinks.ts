import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dataEntityAttachmentApi } from 'lib/api';
import type {
  DataEntityAttachmentApiDeleteLinkRequest,
  DataEntityAttachmentApiGetAttachmentsRequest,
  DataEntityAttachmentApiSaveLinksRequest,
  DataEntityAttachmentApiUpdateLinkRequest,
  DataEntityAttachments,
  DataEntityFile,
  DataEntityLink,
} from 'generated-sources';
import { showSuccessToast } from 'lib/errorHandling';
import type { ErrorState } from 'redux/interfaces';

export function useDataEntityAttachments({
  dataEntityId,
}: DataEntityAttachmentApiGetAttachmentsRequest) {
  return useQuery<DataEntityAttachments, ErrorState, (DataEntityFile | DataEntityLink)[]>(
    {
      queryKey: ['dataEntityAttachments'],
      queryFn: () => dataEntityAttachmentApi.getAttachments({ dataEntityId }),
      select: data => [...data.files, ...data.links],
    }
  );
}

export function useSaveDataEntityLinks() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (params: DataEntityAttachmentApiSaveLinksRequest) =>
      await dataEntityAttachmentApi.saveLinks(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Links successfully saved!' });
      await client.invalidateQueries({ queryKey: ['dataEntityAttachments'] });
    },
  });
}

export function useUpdateDataEntityLink() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (params: DataEntityAttachmentApiUpdateLinkRequest) =>
      await dataEntityAttachmentApi.updateLink(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Link successfully updated!' });
      await client.invalidateQueries({ queryKey: ['dataEntityAttachments'] });
    },
  });
}

export function useDeleteDataEntityLink() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (params: DataEntityAttachmentApiDeleteLinkRequest) =>
      dataEntityAttachmentApi.deleteLink(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Link successfully deleted!' });
      await client.invalidateQueries({ queryKey: ['dataEntityAttachments'] });
    },
  });
}
