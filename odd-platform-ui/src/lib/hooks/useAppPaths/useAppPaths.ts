import { useMemo } from 'react';
import { DataModellingRoutes } from 'routes/dataModellingRoutes';
import { generatePath } from 'react-router-dom';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useTermsPaths } from './useTermsPaths';
import { useDataEntityPaths } from './useDataEntityPaths';
import {
  ActivityRoutes,
  SearchRoutes,
  AlertsRoutes,
  ManagementRoutes,
  TermsRoutes,
  DataEntityRoutes,
  DirectoryRoutes,
  DataQualityRoutes,
} from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const termsPaths = useTermsPaths();
  const dataEntityPaths = useDataEntityPaths();

  const getNonExactPath = (path: string) => updatePath(`${path}/*`);
  const getNonExactParamPath = (path: string) => `${path}/*`;

  const basePath = updatePath('');

  // search
  const baseSearchPath = () => `${SearchRoutes.search}`;
  const searchPath = (searchId: string = SearchRoutes.searchIdParam) =>
    updatePath(`${baseSearchPath()}/${searchId}`);

  // Activity
  const activityPath = (query?: string) => {
    const queryStr = `?${query}`;
    return updatePath(`${ActivityRoutes.activity}${query ? queryStr : ''}`);
  };

  // Management
  const integrationPath = (integrationId: string) =>
    updatePath(
      `${ManagementRoutes.management}/${ManagementRoutes.integrations}/${integrationId}`
    );

  // Directories
  const directoryEntitiesListPath = (
    dataSourcePrefix: string,
    dataSourceId: number,
    typeId: number | string
  ) =>
    updatePath(
      `${DirectoryRoutes.directory}/${dataSourcePrefix}/${dataSourceId}/${typeId}`
    );

  const directoryDataSourceListPath = (dataSourcePrefix: string) =>
    updatePath(`${DirectoryRoutes.directory}/${dataSourcePrefix}`);

  // Data modelling
  const queryExamplePath = (queryExampleId: number) =>
    updatePath(
      generatePath(
        `${DataModellingRoutes.BASE_PATH}/${DataModellingRoutes.QUERY_EXAMPLE_PATH}`,
        { queryExampleId: String(queryExampleId) }
      )
    );

  const dataModellingPath = () => updatePath(generatePath(DataModellingRoutes.BASE_PATH));

  return useMemo(
    () => ({
      isPathEmbedded,
      ActivityRoutes,
      SearchRoutes,
      AlertsRoutes,
      ManagementRoutes,
      TermsRoutes,
      DataEntityRoutes,
      DirectoryRoutes,
      DataQualityRoutes,
      basePath,
      updatePath,
      getNonExactPath,
      getNonExactParamPath,
      searchPath,
      activityPath,
      integrationPath,
      directoryEntitiesListPath,
      directoryDataSourceListPath,
      queryExamplePath,
      dataModellingPath,
      ...termsPaths,
      ...dataEntityPaths,
    }),
    [isPathEmbedded, termsPaths, dataEntityPaths]
  );
};

export default useAppPaths;
