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
  return useQuery<
    DataEntityAttachments,
    ErrorState,
    Array<DataEntityFile | DataEntityLink>
  >(
    ['dataEntityAttachments'],
    () => dataEntityAttachmentApi.getAttachments({ dataEntityId }),
    {
      select: data => [...data.files, ...data.links],
    }
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
