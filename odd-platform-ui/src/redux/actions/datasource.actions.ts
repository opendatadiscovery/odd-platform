import { createActionType } from 'redux/lib/helpers';

export const datasourceActionTypePrefix = 'datasources';

export const fetchDatasorcesActionType = createActionType(
  datasourceActionTypePrefix,
  'fetchDatasources'
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
