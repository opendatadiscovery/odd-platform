import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  datasetFieldFieldsCountAtom,
  datasetFieldRowsCountAtom,
  datasetFieldTypesCountAtom,
  datasetStructureRootAtom,
  isSearchUpdatedAtom,
  searchQueryAtom,
  selectedFieldIdAtom,
  datasetVersionsAtom,
} from './atoms';

export default function useStructure() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isSearchUpdated, setIsSearchUpdated] = useAtom(isSearchUpdatedAtom);
  const [selectedFieldId, setSelectedFieldId] = useAtom(selectedFieldIdAtom);
  const [datasetStructureRoot] = useAtom(datasetStructureRootAtom);
  const [datasetFieldRowsCount] = useAtom(datasetFieldRowsCountAtom);
  const [datasetFieldTypesCount] = useAtom(datasetFieldTypesCountAtom);
  const [datasetFieldFieldsCount] = useAtom(datasetFieldFieldsCountAtom);
  const [datasetVersions] = useAtom(datasetVersionsAtom);

  // Create a filtered dataset structure based on the search query
  const filteredDatasetStructureRoot = useMemo(() => {
    if (!searchQuery) return datasetStructureRoot;
    return datasetStructureRoot.filter(
      item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.internalName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, datasetStructureRoot]);

  const idxToScroll = useMemo(
    () => filteredDatasetStructureRoot.findIndex(field => field.id === selectedFieldId),
    [selectedFieldId, filteredDatasetStructureRoot]
  );

  // Update the search query state
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setIsSearchUpdated(prev => !prev);
    },
    [setSearchQuery, setIsSearchUpdated]
  );

  return useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      selectedFieldId,
      setSelectedFieldId,
      isSearchUpdated,
      setIsSearchUpdated,
      handleSearch,
      // filtered dataset structure
      datasetStructureRoot: filteredDatasetStructureRoot,
      idxToScroll,
      datasetFieldRowsCount,
      datasetFieldTypesCount,
      datasetFieldFieldsCount,
      datasetVersions,
    }),
    [
      searchQuery,
      selectedFieldId,
      isSearchUpdated,
      handleSearch,
      filteredDatasetStructureRoot,
      idxToScroll,
      datasetFieldRowsCount,
      datasetFieldTypesCount,
      datasetFieldFieldsCount,
      datasetVersions,
    ]
  );
}
