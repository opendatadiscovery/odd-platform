import React, { type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { ListLayout } from 'components/shared/elements';
import DataSourcesList from './DataSourceList/DataSourceList';
import Directory from './Directory/Directory';
import Entities from './Entities/Entities';

const DirectoryRoutes: FC = () => {
  const { DirectoryRoutes: DirectoryRoutesEnum } = useAppPaths();

  return (
    <ListLayout>
      <Routes>
        <Route path='/' element={<Directory />} />
        <Route
          path={`${DirectoryRoutesEnum.dataSourceTypePrefixParam}`}
          element={<DataSourcesList />}
        />
        <Route
          path={`${DirectoryRoutesEnum.dataSourceTypePrefixParam}/${DirectoryRoutesEnum.dataSourceIdParam}/${DirectoryRoutesEnum.typeIdParam}`}
          element={<Entities />}
        />
        <Route
          path={`${DirectoryRoutesEnum.dataSourceTypePrefixParam}/${DirectoryRoutesEnum.dataSourceIdParam}`}
          element={<Navigate to='all' replace />}
        />
      </Routes>
    </ListLayout>
  );
};

export default DirectoryRoutes;
