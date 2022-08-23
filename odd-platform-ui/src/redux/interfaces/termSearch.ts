import { CountableSearchFilter, TermFacetState } from 'generated-sources';
import { SearchFacetStateById } from 'redux/interfaces/dataEntitySearch';
import { CurrentPageInfo } from './common';

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
