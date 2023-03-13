import { useQuery } from 'react-query';
import { dataEntityApi } from 'lib/api';
import { showServerErrorToast } from 'lib/errorHandling';

interface UseDataEntityMetricsProps {
  dataEntityId: number;
  enabled: boolean;
}

export function useDataEntityMetrics({
  dataEntityId,
  enabled,
}: UseDataEntityMetricsProps) {
  return useQuery(
    ['dataEntityMetrics', dataEntityId],
    () => dataEntityApi.getDataEntityMetrics({ dataEntityId }),
    {
      retry: false,
      refetchOnWindowFocus: false,
      onError: err =>
        showServerErrorToast(err as Response, {
          additionalMessage: 'while loading metrics',
        }),
      enabled,
    }
  );
}
