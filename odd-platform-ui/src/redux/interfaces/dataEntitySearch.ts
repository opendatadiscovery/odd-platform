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

// ST-8 (#1842): `'my'` is gone. It was the My-Objects TAB's pseudo-class; that tab is retired and the owned
// scope is now an ordinary sidebar filter, so a class is either a real entity-class id or `'all'`.
export type SearchClass = number | 'all';
