import { useQuery } from '@tanstack/react-query';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { dataQualityRunsApi } from 'lib/api';

export function useGetDataQualityDashboard(
  params: DataQualityRunsApiGetDataQualityTestsRunsRequest
) {
  return useQuery({
    queryKey: ['dataQualityDashboard'],
    queryFn: async () => dataQualityRunsApi.getDataQualityTestsRuns(params),
  });
}
