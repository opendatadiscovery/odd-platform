import type { DataSetVersionDiff as GeneratedDataSetVersionDiff } from 'generated-sources';
import type { LANGUAGES_MAP } from 'lib/constants';

export type EventType = 'created' | 'added' | 'assigned' | 'updated' | 'deleted';

export type DatasetFieldKey = 'primary' | 'sort' | 'nullable';

export interface DataSetVersionDiff extends GeneratedDataSetVersionDiff {
  childFields?: DataSetVersionDiff[];
}

export interface InfiniteQueryPageInfo {
  total: number;
  nextPage?: number;
}

export type Lang = keyof typeof LANGUAGES_MAP;
