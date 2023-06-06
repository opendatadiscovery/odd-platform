import React, { type FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { ListLayout } from 'components/shared/elements';
import DataSourcesList from './DataSourceList/DataSourceList';
import Directory from './Directory/Directory';

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
          path={`${DirectoryRoutesEnum.dataSourceTypePrefixParam}/:lol`}
          element={<div>entities list</div>}
        />
      </Routes>
    </ListLayout>
  );
};

export default DirectoryRoutes;
