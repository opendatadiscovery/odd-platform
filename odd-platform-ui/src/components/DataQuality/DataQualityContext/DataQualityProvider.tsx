import React, { useMemo, useState } from 'react';
import type { FC } from 'react';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { DataQualityContext } from './DataQualityContext';

type DataQualityProviderProps = React.PropsWithChildren;

export const DataQualityProvider: FC<DataQualityProviderProps> = ({ children }) => {
  const [filterState, setFilters] =
    useState<DataQualityRunsApiGetDataQualityTestsRunsRequest>({});

  const updateFilter = (
    filterName: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest,
    value: Array<number>
  ) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const providerValue = useMemo(() => ({ filterState, updateFilter }), [filterState]);

  return (
    <DataQualityContext.Provider value={providerValue}>
      {children}
    </DataQualityContext.Provider>
  );
};
