import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetLookupTableId } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import { useGetLookupTable } from 'lib/hooks';
import DatasetDataTable from './DatasetDataTable';

const DatasetData: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const lookupTableId = useAppSelector(getDatasetLookupTableId(dataEntityId))!;
  const { data: lookupTable } = useGetLookupTable({ lookupTableId });

  if (!lookupTable) return null;

  return <DatasetDataTable lookupTable={lookupTable} />;
};

export default DatasetData;
