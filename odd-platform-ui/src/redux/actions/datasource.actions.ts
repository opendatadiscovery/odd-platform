import { createActionType } from 'lib/redux/helpers';

export const datasourceActionTypePrefix = 'datasources';

export const fetchDatasorcesActionType = createActionType(
  datasourceActionTypePrefix,
  'datasources'
);

export const updateDatasourceActionType = createActionType(
  datasourceActionTypePrefix,
  'updateDatasource'
);

export const regenerateDataSourceTokenActionType = createActionType(
  datasourceActionTypePrefix,
  'regenerateDataSourceToken'
);

export const registerDataSourceActionType = createActionType(
  datasourceActionTypePrefix,
  'registerDataSource'
);

export const deleteDatasourceActionType = createActionType(
  datasourceActionTypePrefix,
  'deleteDatasource'
);
