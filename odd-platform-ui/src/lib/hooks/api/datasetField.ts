import { useQuery } from 'react-query';
import { datasetFieldApiClient } from 'lib/api';
import { showServerErrorToast } from 'lib/errorHandling';

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
