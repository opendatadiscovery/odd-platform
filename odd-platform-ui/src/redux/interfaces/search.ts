import {
  FacetState,
  SearchFilterState,
  CountableSearchFilter,
  DataEntityClassNameEnum,
} from 'generated-sources';
import { CurrentPageInfo } from './common';

export type OptionalFacetMap = Omit<FacetState, 'entityClasses'>;
export type OptionalFacetNames = keyof OptionalFacetMap;
export type SearchFacetNames = keyof Partial<FacetState>;

export type FacetStateUpdate = {
  facetName: SearchFacetNames;
  facetOptionId?: number | string;
  facetOptionName?: string;
  facetOptionState: boolean;
  facetSingle?: boolean;
};

export type SearchTotalsByName = {
  [facetName in DataEntityClassNameEnum]?: CountableSearchFilter;
} & { all?: number; myObjectsTotal?: number };

export type SearchFilterStateSynced = SearchFilterState & {
  syncedState: boolean;
};

export type SearchFacetStateById = {
  [facetOptionId: string]: SearchFilterStateSynced;
};
export type SearchFacetsByName = {
  [facetName in SearchFacetNames]?: SearchFacetStateById;
};

export interface FacetOptions {
  facetName?: OptionalFacetNames;
  facetOptions: CountableSearchFilter[];
  page: number;
}

export type FacetOptionsByName = {
  [facetName in OptionalFacetNames]?: {
    items: CountableSearchFilter[];
    pageInfo: CurrentPageInfo;
  };
};

export type SearchType = number | 'all' | 'my';
