import React, { type FC } from 'react';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  BreadCrumbs,
  getCapitalizedDatasourceNameFromPrefix,
} from 'components/shared/elements';

interface BreadCrumbsProps {
  dataSourceName?: string;
}

const DirectoryBreadCrumbs: FC<BreadCrumbsProps> = ({ dataSourceName }) => {
  const { DirectoryRoutes } = useAppPaths();
  const { dataSourceTypePrefix, dataSourceId } = useAppParams();

  const labelsMap = {
    [DirectoryRoutes.directory]: 'Directories',
    [dataSourceTypePrefix]: getCapitalizedDatasourceNameFromPrefix(dataSourceTypePrefix),
    [dataSourceId]: dataSourceName,
  };

  const pathNames = [
    DirectoryRoutes.directory,
    dataSourceTypePrefix,
    dataSourceId,
  ].filter(Boolean);

  return <BreadCrumbs pathNames={pathNames} labelsMap={labelsMap} />;
};

export default DirectoryBreadCrumbs;
