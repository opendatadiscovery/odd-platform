import type React from 'react';
import { createGenericContext } from 'lib/genericContext';
import type { DataSetField, DataSetStats } from 'generated-sources';

export type SearchQuery = string;
export type IsSearchUpdated = boolean;
export type SelectedFieldId = number;

export interface StructureContextProps {
  searchQuery: SearchQuery;
  setSearchQuery: React.Dispatch<React.SetStateAction<SearchQuery>>;
  selectedFieldId: SelectedFieldId;
  setSelectedFieldId: React.Dispatch<React.SetStateAction<SelectedFieldId>>;
  isSearchUpdated: IsSearchUpdated;
  setIsSearchUpdated: React.Dispatch<React.SetStateAction<IsSearchUpdated>>;
  handleSearch: (query: string) => void;
  datasetStructureRoot: DataSetField[];
  idxToScroll: number;
  datasetRowsCount: DataSetStats['rowsCount'];
}

export const [useStructureContext, StructureContextProvider] =
  createGenericContext<StructureContextProps>();
