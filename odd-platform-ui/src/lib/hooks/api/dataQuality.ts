import { useQuery } from '@tanstack/react-query';
import { dataQualityRunsApi } from 'lib/api';

export function useGetDataQualityDashboard() {
  return useQuery({
    queryKey: ['dataQualityDashboard'],
    queryFn: async () => dataQualityRunsApi.getDataQualityTestsRuns(),
  });
}
