import React from 'react';
import type { DataSetField } from 'generated-sources';
import {
  type StructureContextProps,
  type SearchQuery,
  type SelectedFieldId,
  type IsSearchUpdated,
  StructureContextProvider,
} from './StructureContext';

interface StructureProviderProps {
  datasetStructureRoot: DataSetField[];
}

const StructureProvider: React.FC<StructureProviderProps> = ({
  children,
  datasetStructureRoot,
}) => {
  const [searchQuery, setSearchQuery] = React.useState<SearchQuery>('');
  const [isSearchUpdated, setIsSearchUpdated] = React.useState<IsSearchUpdated>(false);
  const [selectedFieldId, setSelectedFieldId] =
    React.useState<SelectedFieldId>(undefined);

  React.useEffect(() => {
    setSelectedFieldId(datasetStructureRoot[0]?.id);
  }, [datasetStructureRoot]);

  const idxToScroll = React.useMemo(
    () => datasetStructureRoot.findIndex(field => field.id === selectedFieldId),
    [selectedFieldId]
  );

  const handleSearch = React.useCallback(
    (query: string) => {
      const itemIdx = datasetStructureRoot.findIndex(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      if (itemIdx > -1) {
        setSelectedFieldId(datasetStructureRoot[itemIdx].id);
        setIsSearchUpdated(prev => !prev);
      }
    },
    [datasetStructureRoot]
  );

  const providerValue = React.useMemo<StructureContextProps>(
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
    }),
    [searchQuery, selectedFieldId, handleSearch, isSearchUpdated, datasetStructureRoot]
  );

  return (
    <StructureContextProvider value={providerValue}>{children}</StructureContextProvider>
  );
};

export default StructureProvider;
