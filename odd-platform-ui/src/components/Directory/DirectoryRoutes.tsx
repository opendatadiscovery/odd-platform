import React, { type FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ListLayout } from 'components/shared/elements';
import DataSourcesList from './DataSourceList/DataSourceList';
import Directory from './Directory/Directory';
import Entities from './Entities/Entities';

const DirectoryRoutes: FC = () => (
  <ListLayout>
    <Routes>
      <Route path='/' element={<Directory />} />
      <Route path=':dataSourceTypePrefix' element={<DataSourcesList />} />
      <Route path=':dataSourceTypePrefix/:dataSourceId/:typeId' element={<Entities />} />
      <Route
        path=':dataSourceTypePrefix/:dataSourceId'
        element={<Navigate to='all' replace />}
      />
    </Routes>
  </ListLayout>
);

export default DirectoryRoutes;
