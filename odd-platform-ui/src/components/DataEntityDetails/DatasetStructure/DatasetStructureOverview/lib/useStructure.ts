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

  const idxToScroll = useMemo(
    () => datasetStructureRoot.findIndex(field => field.id === selectedFieldId),
    [selectedFieldId, datasetStructureRoot]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const itemIdx = datasetStructureRoot?.findIndex(
        item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.internalName?.toLowerCase().includes(query.toLowerCase())
      );

      if (itemIdx !== undefined && itemIdx > -1) {
        setSelectedFieldId(datasetStructureRoot?.[itemIdx].id);
        setIsSearchUpdated(prev => !prev);
      }
    },
    [datasetStructureRoot]
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
      datasetStructureRoot,
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
      datasetStructureRoot,
      idxToScroll,
      datasetFieldRowsCount,
      datasetFieldTypesCount,
      datasetFieldFieldsCount,
      datasetVersions,
    ]
  );
}
