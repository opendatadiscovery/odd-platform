import type {
  CountableSearchFilter,
  SearchFilterState,
  TermFacetState,
} from 'generated-sources';
import type { CurrentPageInfo } from './common';

export type TermSearchOptionalFacetMap = TermFacetState;
export type TermSearchOptionalFacetNames = keyof TermSearchOptionalFacetMap;
export type TermSearchFacetNames = keyof Partial<TermFacetState>;

export type TermSearchFacetStateUpdate = {
  facetName: TermSearchFacetNames;
  facetOptionId?: number | string;
  facetOptionName?: string;
  facetOptionState: boolean;
  facetSingle?: boolean;
};

export type TermsSearchFilterStateSynced = SearchFilterState & {
  syncedState: boolean;
};

export type TermsSearchFacetStateById = {
  [facetOptionId: string]: TermsSearchFilterStateSynced;
};

export type TermSearchFacetsByName = {
  [facetName in TermSearchFacetNames]?: TermsSearchFacetStateById;
};

export interface TermSearchFacetOptions {
  facetName?: TermSearchOptionalFacetNames;
  facetOptions: CountableSearchFilter[];
  page: number;
}

export type TermSearchFacetOptionsByName = {
  [facetName in TermSearchOptionalFacetNames]?: {
    items: CountableSearchFilter[];
    pageInfo: CurrentPageInfo;
  };
};
