import React from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetLookupTableId } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import { useGetLookupTable } from 'lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import DatasetDataTable from './DatasetDataTable';

const DatasetData: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const lookupTableId = useAppSelector(getDatasetLookupTableId(dataEntityId))!;
  const { data: lookupTable } = useGetLookupTable({ lookupTableId });

  if (!lookupTable) return null;

  return (
    <WithPermissionsProvider
      allowedPermissions={[
        Permission.LOOKUP_TABLE_DATA_CREATE,
        Permission.LOOKUP_TABLE_DATA_UPDATE,
        Permission.LOOKUP_TABLE_DATA_DELETE,
      ]}
      resourcePermissions={[]}
    >
      <DatasetDataTable lookupTable={lookupTable} />
    </WithPermissionsProvider>
  );
};

export default DatasetData;
