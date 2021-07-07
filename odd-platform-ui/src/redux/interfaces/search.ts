import {
  FacetState,
  SearchFilterState,
  DataEntityTypeNameEnum,
  CountableSearchFilter,
} from 'generated-sources';
import { CurrentPageInfo } from './common';

export type OptionalFacetMap = Omit<FacetState, 'types'>;
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
  [facetName in DataEntityTypeNameEnum]?: CountableSearchFilter;
} & { all?: number; myObjectsTotal?: number };

export type SearchFilterStateSynced = SearchFilterState & {
  syncedState: boolean;
};

export type SearchFacetStateById = {
  [facetOptionId: string]: SearchFilterStateSynced;
};
export type SearcFacetsByName = {
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
