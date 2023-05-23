import { dataEntityAttachmentApi, dataEntityFileUploadApi } from 'lib/api';
import { asyncPool } from 'lib/helpers';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from 'lib/errorHandling';
import type {
  DataEntityAttachmentApiDeleteFileRequest,
  DataEntityAttachmentApiDownloadFileRequest,
  DataEntityAttachmentApiGetUploadOptionsRequest,
} from 'generated-sources';

const CHUNK_SIZE = 100 * 1024;
const FILE_UPLOAD_POOL_LIMIT = 2;

interface UploadFileParams {
  dataEntityId: number;
  uploadId: string;
  file: Blob;
  fileSize: number;
  chunkSize: number;
  poolLimit?: number;
}

async function uploadFile({
  file,
  fileSize,
  chunkSize,
  poolLimit = 1,
  dataEntityId,
  uploadId,
}: UploadFileParams) {
  const chunks = Math.ceil(fileSize / chunkSize);

  const sliceAndUpload = (index: number) => {
    const start = index * chunkSize;
    const end = index + 1 === chunks ? fileSize : (index + 1) * chunkSize;
    const chunk = file.slice(start, end);
    const stringIndex = String(index);

    const uploadChunkParams = { dataEntityId, uploadId, file: chunk, index: stringIndex };

    return dataEntityFileUploadApi.uploadFileChunk(uploadChunkParams);
  };

  return asyncPool(poolLimit, [...new Array(chunks).keys()], sliceAndUpload);
}

interface UseSaveDataEntityFileParams {
  dataEntityId: number;
  file: Blob;
}

export function useSaveDataEntityFile() {
  const client = useQueryClient();

  return useMutation(
    async ({ dataEntityId, file }: UseSaveDataEntityFileParams) => {
      const dataEntityUploadFormData = { fileName: file.name };
      const initialUploadParams = { dataEntityId, dataEntityUploadFormData };
      const { id: uploadId } = await dataEntityAttachmentApi.initiateFileUpload(
        initialUploadParams
      );

      await uploadFile({
        file,
        fileSize: file.size,
        chunkSize: CHUNK_SIZE,
        poolLimit: FILE_UPLOAD_POOL_LIMIT,
        dataEntityId,
        uploadId,
      });

      await dataEntityAttachmentApi.completeFileUpload({
        dataEntityId,
        uploadId,
      });
    },
    {
      onSuccess: () => {
        showSuccessToast({ message: 'File successfully saved!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useDownloadDataEntityFile({
  dataEntityId,
  fileId,
}: DataEntityAttachmentApiDownloadFileRequest) {
  return useQuery(
    ['dataEntityFiles', dataEntityId, fileId],
    () => dataEntityAttachmentApi.downloadFile({ dataEntityId, fileId }),
    { enabled: false }
  );
}

export function useDeleteDataEntityFile() {
  const client = useQueryClient();

  return useMutation(
    (params: DataEntityAttachmentApiDeleteFileRequest) =>
      dataEntityAttachmentApi.deleteFile(params),
    {
      onSuccess: () => {
        showSuccessToast({ message: 'File successfully deleted!' });
        client.invalidateQueries(['dataEntityAttachments']);
      },
    }
  );
}

export function useGetUploadOptions({
  dataEntityId,
}: DataEntityAttachmentApiGetUploadOptionsRequest) {
  return useQuery(['dataEntityUploadOptions', dataEntityId], () =>
    dataEntityAttachmentApi.getUploadOptions({ dataEntityId })
  );
}
