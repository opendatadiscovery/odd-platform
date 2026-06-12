import React, { type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getResourcePermissions } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';

const DatasetStructureOverview = React.lazy(
  () => import('./DatasetStructureOverview/DatasetStructureOverview')
);
const DatasetStructureCompare = React.lazy(
  () => import('./DatasetStructureCompare/DatasetStructureCompare')
);

const DatasetStructure: FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route
          path='overview'
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.DATASET_FIELD_ENUMS_UPDATE,
                Permission.DATASET_FIELD_TAGS_UPDATE,
                Permission.DATASET_FIELD_DESCRIPTION_UPDATE,
                Permission.DATASET_FIELD_ADD_TERM,
                Permission.DATASET_FIELD_DELETE_TERM,
                Permission.DATASET_FIELD_INTERNAL_NAME_UPDATE,
                Permission.LOOKUP_TABLE_DEFINITION_CREATE,
                Permission.LOOKUP_TABLE_DEFINITION_UPDATE,
                Permission.LOOKUP_TABLE_DEFINITION_DELETE,
              ]}
              resourcePermissions={resourcePermissions}
              Component={DatasetStructureOverview}
            />
          }
        >
          <Route path=':versionId' />
          <Route path='field/:fieldId' element={<Navigate to='overview' />} />
        </Route>
        <Route path='compare' element={<DatasetStructureCompare />} />
        <Route path='' element={<Navigate to='overview' />} />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DatasetStructure;
