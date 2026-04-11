import type {
  CountableSearchFilter,
  DataEntityClassNameEnum,
  FacetState,
  SearchFilterState,
} from 'generated-sources';
import type { CurrentPageInfo } from './common';

export type OptionalFacetMap = Omit<FacetState, 'entityClasses'>;
export type OptionalFacetNames = keyof OptionalFacetMap;
export type SearchFacetNames = keyof Partial<FacetState>;

export interface FacetStateUpdate {
  facetName: SearchFacetNames;
  facetOptionId?: number | string;
  facetOptionName?: string;
  facetOptionState: boolean;
  facetSingle?: boolean;
}

export type SearchTotalsByName = Partial<
  Record<DataEntityClassNameEnum, CountableSearchFilter>
> & { all?: number; myObjectsTotal?: number };

export type SearchFilterStateSynced = SearchFilterState & {
  syncedState: boolean;
};

export type SearchFacetStateById = Record<string, SearchFilterStateSynced>;

export type SearchFacetsByName = Partial<Record<SearchFacetNames, SearchFacetStateById>>;

export interface FacetOptions {
  facetName?: OptionalFacetNames;
  facetOptions: CountableSearchFilter[];
  page: number;
}

export type FacetOptionsByName = Partial<
  Record<
    OptionalFacetNames,
    {
      items: CountableSearchFilter[];
      pageInfo: CurrentPageInfo;
    }
  >
>;

export type SearchClass = number | 'all' | 'my';
