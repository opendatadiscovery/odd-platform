import { useMutation, useQuery } from '@tanstack/react-query';
import { datasetFieldApiClient } from 'lib/api';
import { showServerErrorToast, showSuccessToast } from 'lib/errorHandling';
import type { DatasetFieldApiDeleteTermFromDatasetFieldRequest } from 'generated-sources';

interface UseDataEntityMetricsProps {
  datasetFieldId: number;
}

export function useDataSetFieldMetrics({ datasetFieldId }: UseDataEntityMetricsProps) {
  return useQuery(
    ['dataSetFieldMetrics', datasetFieldId],
    () => datasetFieldApiClient.getDatasetFieldMetrics({ datasetFieldId }),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: err =>
        showServerErrorToast(err as Response, {
          additionalMessage: 'while loading field metrics',
        }),
    }
  );
}

interface UseAddDatasetFieldTermParams {
  datasetFieldId: number;
  termId: number;
}

export function useAddDatasetFieldTerm() {
  return useMutation(
    ({ datasetFieldId, termId }: UseAddDatasetFieldTermParams) => {
      const params = { datasetFieldId, datasetFieldTermFormData: { termId } };

      return datasetFieldApiClient.addDatasetFieldTerm(params);
    },
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Term successfully added!' });
      },
    }
  );
}

export function useDeleteDatasetFieldTerm() {
  return useMutation(
    async (params: DatasetFieldApiDeleteTermFromDatasetFieldRequest) => {
      await datasetFieldApiClient.deleteTermFromDatasetField(params);

      return params.termId;
    },
    {
      onSuccess: () => {
        showSuccessToast({ message: 'Term successfully deleted!' });
      },
    }
  );
}
