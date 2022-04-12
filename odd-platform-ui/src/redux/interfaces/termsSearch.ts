import {
  CountableSearchFilter,
  TermFacetState,
  SearchFilterState,
} from '../../generated-sources';
import { CurrentPageInfo } from './common';

export type TermsOptionalFacetMap = Partial<TermFacetState>;
export type TermsOptionalFacetNames = keyof TermsOptionalFacetMap;
export type TermsFacetNames = keyof Partial<TermFacetState>;

export type TermsFacetStateUpdate = {
  facetName: TermsFacetNames;
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
export type TermsSearchFacetsByName = {
  [facetName in TermsFacetNames]?: TermsSearchFacetStateById;
};

export interface TermsSearchFacetOptions {
  facetName?: TermsOptionalFacetNames;
  facetOptions: CountableSearchFilter[];
  page: number;
}

export type TermsSearchFacetOptionsByName = {
  [facetName in TermsOptionalFacetNames]?: {
    items: CountableSearchFilter[];
    pageInfo: CurrentPageInfo;
  };
};
