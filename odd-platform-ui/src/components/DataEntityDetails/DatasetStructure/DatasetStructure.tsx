import React, { type FC } from 'react';
import { AppSuspenseWrapper } from 'components/shared/elements';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission, PermissionResourceType } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { getResourcePermissions } from 'redux/selectors';

const DatasetStructureOverview = React.lazy(
  () => import('./DatasetStructureOverview/DatasetStructureOverview')
);
const DatasetStructureCompare = React.lazy(
  () => import('./DatasetStructureCompare/DatasetStructureCompare')
);

const DatasetStructure: FC = () => {
  const { DataEntityRoutes } = useAppPaths();
  const { dataEntityId } = useAppParams();

  const resourcePermissions = useAppSelector(
    getResourcePermissions(PermissionResourceType.DATA_ENTITY, dataEntityId)
  );

  return (
    <AppSuspenseWrapper>
      <Routes>
        <Route
          path={DataEntityRoutes.overview}
          element={
            <WithPermissionsProvider
              allowedPermissions={[
                Permission.DATASET_FIELD_ENUMS_UPDATE,
                Permission.DATASET_FIELD_LABELS_UPDATE,
                Permission.DATASET_FIELD_DESCRIPTION_UPDATE,
                Permission.DATASET_FIELD_ADD_TERM,
                Permission.DATASET_FIELD_DELETE_TERM,
              ]}
              resourcePermissions={resourcePermissions}
              Component={DatasetStructureOverview}
            />
          }
        >
          <Route path={DataEntityRoutes.versionIdParam} />
        </Route>
        <Route
          path={DataEntityRoutes.structureCompare}
          element={<DatasetStructureCompare />}
        />
        <Route path='' element={<Navigate to={DataEntityRoutes.overview} />} />
      </Routes>
    </AppSuspenseWrapper>
  );
};

export default DatasetStructure;
