import { useMutation, useQuery } from '@tanstack/react-query';
import { datasetFieldApiClient } from 'lib/api';
import { showServerErrorToast, showSuccessToast } from 'lib/errorHandling';
import type {
  DatasetFieldApiDeleteTermFromDatasetFieldRequest,
  DatasetFieldApiUpdateDatasetFieldInternalNameRequest,
} from 'generated-sources';

interface UseDataEntityMetricsProps {
  datasetFieldId: number;
}

export function useDataSetFieldMetrics({ datasetFieldId }: UseDataEntityMetricsProps) {
  return useQuery({
    queryKey: ['dataSetFieldMetrics', datasetFieldId],
    queryFn: async () =>
      datasetFieldApiClient
        .getDatasetFieldMetrics({ datasetFieldId })
        .catch((err: Response) => {
          showServerErrorToast(err, { additionalMessage: 'while loading field metrics' });
        }),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

interface UseAddDatasetFieldTermParams {
  datasetFieldId: number;
  termId: number;
}

export function useAddDatasetFieldTerm() {
  return useMutation({
    mutationFn: async ({ termId, datasetFieldId }: UseAddDatasetFieldTermParams) =>
      datasetFieldApiClient.addDatasetFieldTerm({
        datasetFieldId,
        datasetFieldTermFormData: { termId },
      }),
    onSuccess: () => showSuccessToast({ message: 'Term successfully added!' }),
  });
}

export function useDeleteDatasetFieldTerm() {
  return useMutation({
    mutationFn: async (params: DatasetFieldApiDeleteTermFromDatasetFieldRequest) => {
      await datasetFieldApiClient.deleteTermFromDatasetField(params);

      return params.termId;
    },
    onSuccess: () => showSuccessToast({ message: 'Term successfully deleted!' }),
  });
}

export function useUpdateDatasetFieldInternalName() {
  return useMutation({
    mutationFn: async (params: DatasetFieldApiUpdateDatasetFieldInternalNameRequest) =>
      datasetFieldApiClient.updateDatasetFieldInternalName(params),
    onSuccess: () => showSuccessToast({ message: 'Internal name successfully updated!' }),
  });
}
