import React, { type FC } from 'react';
import {
  BreadCrumbs,
  getCapitalizedDatasourceNameFromPrefix,
} from 'components/shared/elements';
import { useDirectoryRouteParams } from 'routes';

interface BreadCrumbsProps {
  dataSourceName?: string;
}

const DirectoryBreadCrumbs: FC<BreadCrumbsProps> = ({ dataSourceName }) => {
  const { dataSourceTypePrefix, dataSourceId } = useDirectoryRouteParams();

  const labelsMap = {
    directory: 'Directories',
    [dataSourceTypePrefix]: getCapitalizedDatasourceNameFromPrefix(dataSourceTypePrefix),
    [dataSourceId]: dataSourceName,
  };

  const pathNames = ['directory', dataSourceTypePrefix, dataSourceId].filter(Boolean);

  return <BreadCrumbs pathNames={pathNames} labelsMap={labelsMap} />;
};

export default DirectoryBreadCrumbs;
