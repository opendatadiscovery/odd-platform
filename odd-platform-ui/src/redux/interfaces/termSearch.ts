import {
  CountableSearchFilter,
  TermFacetState,
  SearchFilterState,
} from 'generated-sources';
import { CurrentPageInfo } from './common';

export type TermSearchOptionalFacetMap = Partial<TermFacetState>;
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

export type TermSearchFilterStateSynced = SearchFilterState & {
  // todo REPLACE WITH SearchFilterState
  syncedState: boolean;
};

export type TermSearchFacetStateById = {
  [facetOptionId: string]: TermSearchFilterStateSynced;
};

export type TermSearchFacetsByName = {
  [facetName in TermSearchFacetNames]?: TermSearchFacetStateById;
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
