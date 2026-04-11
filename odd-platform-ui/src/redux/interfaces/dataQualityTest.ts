import { type DataQualityTest } from 'generated-sources';

export interface DataSetQualityTestsStatusCount {
  success: number;
  failed: number;
  broken: number;
  aborted: number;
  skipped: number;
  unknown: number;
}

export type DatasetQualityTestList = Record<string, DataQualityTest[]>;
