import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import type { DataSetFieldTypeTypeEnum } from 'generated-sources';
import {
  datasetFieldFieldsCountAtom,
  datasetFieldRowsCountAtom,
  datasetFieldTypesCountAtom,
  datasetStructureRootAtom,
  isSearchUpdatedAtom,
  searchQueryAtom,
  selectedFieldIdAtom,
  selectedFieldTypesAtom,
  selectedTagIdsAtom,
  datasetVersionsAtom,
} from './atoms';
import { aggregateFieldTags, applyStructureFilters, hasActiveFilters } from './filtering';

export default function useStructure() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isSearchUpdated, setIsSearchUpdated] = useAtom(isSearchUpdatedAtom);
  const [selectedFieldId, setSelectedFieldId] = useAtom(selectedFieldIdAtom);
  const [selectedTagIds, setSelectedTagIds] = useAtom(selectedTagIdsAtom);
  const [selectedFieldTypes, setSelectedFieldTypes] = useAtom(selectedFieldTypesAtom);
  const [datasetStructureRoot] = useAtom(datasetStructureRootAtom);
  const [datasetFieldRowsCount] = useAtom(datasetFieldRowsCountAtom);
  const [datasetFieldTypesCount] = useAtom(datasetFieldTypesCountAtom);
  const [datasetFieldFieldsCount] = useAtom(datasetFieldFieldsCountAtom);
  const [datasetVersions] = useAtom(datasetVersionsAtom);

  // The distinct tags present across the dataset's columns (with per-tag column counts),
  // aggregated from the full structure so the chip set stays stable while filtering.
  const availableTags = useMemo(
    () => aggregateFieldTags(datasetStructureRoot),
    [datasetStructureRoot]
  );

  // Filter the structure by the name search AND the tag facet AND the type facet.
  const filteredDatasetStructureRoot = useMemo(
    () =>
      applyStructureFilters(datasetStructureRoot, {
        query: searchQuery,
        tagIds: selectedTagIds,
        types: selectedFieldTypes,
      }),
    [searchQuery, selectedTagIds, selectedFieldTypes, datasetStructureRoot]
  );

  const filtersActive = useMemo(
    () =>
      hasActiveFilters({
        query: searchQuery,
        tagIds: selectedTagIds,
        types: selectedFieldTypes,
      }),
    [searchQuery, selectedTagIds, selectedFieldTypes]
  );

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

  const toggleTagFilter = useCallback(
    (tagId: number) => {
      setSelectedTagIds(prev =>
        prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
      );
    },
    [setSelectedTagIds]
  );

  const toggleTypeFilter = useCallback(
    (type: DataSetFieldTypeTypeEnum) => {
      setSelectedFieldTypes(prev =>
        prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
      );
    },
    [setSelectedFieldTypes]
  );

  // Reset every in-page filter (name search + tag facet + type facet). Also used on
  // revision change — a new schema revision can drop a tag the active filter references.
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTagIds([]);
    setSelectedFieldTypes([]);
  }, [setSearchQuery, setSelectedTagIds, setSelectedFieldTypes]);

  return useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      selectedFieldId,
      setSelectedFieldId,
      isSearchUpdated,
      setIsSearchUpdated,
      handleSearch,
      // in-page column filters (#1679)
      availableTags,
      selectedTagIds,
      toggleTagFilter,
      selectedFieldTypes,
      toggleTypeFilter,
      filtersActive,
      clearFilters,
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
      availableTags,
      selectedTagIds,
      toggleTagFilter,
      selectedFieldTypes,
      toggleTypeFilter,
      filtersActive,
      clearFilters,
      filteredDatasetStructureRoot,
      idxToScroll,
      datasetFieldRowsCount,
      datasetFieldTypesCount,
      datasetFieldFieldsCount,
      datasetVersions,
    ]
  );
}
