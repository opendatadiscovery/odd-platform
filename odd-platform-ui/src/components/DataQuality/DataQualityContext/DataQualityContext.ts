import { createContext, useContext } from 'react';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';

export interface DataQualityContextProps {
  filterState: DataQualityRunsApiGetDataQualityTestsRunsRequest;
  updateFilter: (
    filterName: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest,
    value: Array<number>
  ) => void;
}

const defaultBehaviour: DataQualityContextProps = {
  filterState: {},
  updateFilter: () => {},
};

export const DataQualityContext =
  createContext<DataQualityContextProps>(defaultBehaviour);

export const useDataQualityContext = () => useContext(DataQualityContext);
