import { useQuery } from '@tanstack/react-query';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { dataQualityRunsApi } from 'lib/api';

export function useGetDataQualityDashboard(
  params: DataQualityRunsApiGetDataQualityTestsRunsRequest
) {
  console.log('useGetDataQualityDashboard');
  return useQuery({
    queryKey: ['dataQualityDashboard', params],
    queryFn: async () => dataQualityRunsApi.getDataQualityTestsRuns(params),
  });
}
