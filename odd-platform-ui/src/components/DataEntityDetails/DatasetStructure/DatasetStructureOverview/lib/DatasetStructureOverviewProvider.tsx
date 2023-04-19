import React, { type PropsWithChildren } from 'react';
import { Provider } from 'jotai';
import type { DataSetField, DataSetVersion } from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import {
  datasetStructureRootAtom,
  selectedFieldIdAtom,
  datasetFieldRowsCountAtom,
  datasetFieldTypesCountAtom,
  datasetFieldFieldsCountAtom,
  datasetVersionsAtom,
} from './atoms';
import HydrateAtoms, { type InitialValues } from './HydrateAtoms';

interface DatasetStructureOverviewProviderProps extends PropsWithChildren {
  datasetStructureRoot: DataSetField[];
  initialSelectedFieldId: number;
  datasetFieldTypesCount: DataSetStructureTypesCount;
  datasetFieldRowsCount: number;
  datasetFieldFieldsCount: number;
  datasetVersions: DataSetVersion[];
}

const DatasetStructureOverviewProvider: React.FC<
  DatasetStructureOverviewProviderProps
> = ({
  children,
  datasetStructureRoot,
  initialSelectedFieldId,
  datasetFieldRowsCount,
  datasetFieldTypesCount,
  datasetFieldFieldsCount,
  datasetVersions,
}) => {
  const initialValues: InitialValues = [
    [datasetStructureRootAtom, datasetStructureRoot],
    [selectedFieldIdAtom, initialSelectedFieldId],
    [datasetFieldRowsCountAtom, datasetFieldRowsCount],
    [datasetFieldTypesCountAtom, datasetFieldTypesCount],
    [datasetFieldFieldsCountAtom, datasetFieldFieldsCount],
    [datasetVersionsAtom, datasetVersions],
  ];

  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  );
};

export default DatasetStructureOverviewProvider;
