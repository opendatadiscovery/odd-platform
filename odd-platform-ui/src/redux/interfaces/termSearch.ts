import { CountableSearchFilter, TermFacetState } from 'generated-sources';
import { CurrentPageInfo } from './common';
import { SearchFacetStateById } from './search';

export type TermSearchOptionalFacetMap = TermFacetState;
export type TermSearchOptionalFacetNames =
  keyof TermSearchOptionalFacetMap;
export type TermSearchFacetNames = keyof Partial<TermFacetState>;

export type TermSearchFacetStateUpdate = {
  facetName: TermSearchFacetNames;
  facetOptionId?: number | string;
  facetOptionName?: string;
  facetOptionState: boolean;
  facetSingle?: boolean;
};

export type TermSearchFacetsByName = {
  [facetName in TermSearchFacetNames]?: SearchFacetStateById;
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
