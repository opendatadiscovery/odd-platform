import { useQuery } from '@tanstack/react-query';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { dataQualityRunsApi } from 'lib/api';
import type { DataQualityResults } from 'generated-sources/models/DataQualityResults';
import type { DataQualityRunStatusCount } from 'generated-sources/models/DataQualityRunStatusCount';

const emptyTestResults: Array<DataQualityRunStatusCount> = [
  {
    status: 'SUCCESS',
    count: 0,
  },
  {
    status: 'FAILED',
    count: 0,
  },
  {
    status: 'SKIPPED',
    count: 0,
  },
  {
    status: 'BROKEN',
    count: 0,
  },
  {
    status: 'ABORTED',
    count: 0,
  },
  {
    status: 'UNKNOWN',
    count: 0,
  },
];

const initialData: DataQualityResults = {
  testResults: [
    {
      category: 'Assertion Tests',
      results: [...emptyTestResults],
    },
    {
      category: 'Freshness Anomalies',
      results: [...emptyTestResults],
    },
    {
      category: 'Schema Changes',
      results: [...emptyTestResults],
    },
    {
      category: 'Volume Anomalies',
      results: [...emptyTestResults],
    },
    {
      category: 'Column Values Anomalies',
      results: [...emptyTestResults],
    },
    {
      category: 'Unknown category',
      results: [...emptyTestResults],
    },
  ],
  tablesDashboard: {
    tablesHealth: {
      healthyTables: 0,
      errorTables: 0,
      warningTables: 0,
    },
    monitoredTables: {
      monitoredTables: 0,
      notMonitoredTables: 0,
    },
  },
};

export function useGetDataQualityDashboard(
  params: DataQualityRunsApiGetDataQualityTestsRunsRequest
) {
  return useQuery({
    queryKey: ['dataQualityDashboard', params],
    queryFn: async () => dataQualityRunsApi.getDataQualityTestsRuns(params),
    initialData,
  });
}
