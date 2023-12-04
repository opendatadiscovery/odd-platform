import { generatePath, useParams } from 'react-router-dom';
import type { DataSource, DataSourceType } from '../generated-sources';

const BASE_PATH = 'directory';

export function directoryPath() {
  return BASE_PATH;
}

const DATA_SOURCE_TYPE_PREFIX_PARAM = ':dataSourceTypePrefix';
const DATA_SOURCE_TYPE_PREFIX = 'dataSourceTypePrefix';
const DATA_SOURCE_ID_PARAM = ':dataSourceId';
const DATA_SOURCE_ID = 'dataSourceId';
const TYPE_ID_PARAM = ':typeId';
const TYPE_ID = 'typeId';

interface DirectoryRouteParams {
  [DATA_SOURCE_TYPE_PREFIX]: string;
  [DATA_SOURCE_ID]: string;
  [TYPE_ID]: string;
}

interface AppDirectoryRouteParams {
  [DATA_SOURCE_TYPE_PREFIX]: DataSourceType['prefix'];
  [DATA_SOURCE_ID]: DataSource['id'];
  [TYPE_ID]: undefined | number;
}

export const useDirectoryRouteParams = (): AppDirectoryRouteParams => {
  const { dataSourceId, dataSourceTypePrefix, typeId } = useParams<
    keyof DirectoryRouteParams
  >() as DirectoryRouteParams;

  const directoriesEntityTypeId = typeId === 'all' ? undefined : parseInt(typeId, 10);

  return {
    dataSourceId: parseInt(dataSourceId, 10),
    dataSourceTypePrefix,
    typeId: directoriesEntityTypeId,
  };
};

export const directoryDataSourcePath = (
  dataSourcePrefix: DataSourceType['prefix'],
  dataSourceId?: DataSource['id'],
  typeId?: number | 'all'
) => {
  if (dataSourceId && typeId) {
    return generatePath(
      `${BASE_PATH}/${DATA_SOURCE_TYPE_PREFIX_PARAM}/${DATA_SOURCE_ID_PARAM}/${TYPE_ID_PARAM}`,
      {
        [DATA_SOURCE_TYPE_PREFIX]: dataSourcePrefix,
        [DATA_SOURCE_ID]: String(dataSourceId),
        [TYPE_ID]: String(typeId),
      }
    );
  }

  return generatePath(`${BASE_PATH}/${DATA_SOURCE_TYPE_PREFIX_PARAM}`, {
    [DATA_SOURCE_TYPE_PREFIX]: dataSourcePrefix,
  });
};
