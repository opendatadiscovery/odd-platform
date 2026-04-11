import { createActionType } from 'redux/lib/helpers';

export const dataEntitiesActionTypePrefix = 'dataEntities';

export const fetchDataEntitiesClassesAndTypesActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchDataEntityClassesAndTypes'
);

export const fetchDataEntityDetailsActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchDataEntityDetails'
);

export const updateDataEntityTagsActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityTags'
);

export const updateDataEntityInternalDescriptionActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityInternalDescription'
);

export const updateDataEntityInternalNameActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityInternalName'
);

export const fetchMyDataEntitiesActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyDataEntities'
);

export const fetchMyUpstreamDataEntitiesActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyUpstreamDataEntities'
);

export const fetchMyDownstreamDataEntitiesActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyDownstreamDataEntities'
);

export const fetchPopularDataEntitiesActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyPopularDataEntities'
);

export const createDataEntityGroupActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'createDataEntityGroup'
);
export const updateDataEntityGroupActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityGroup'
);
export const deleteDataEntityGroupActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'deleteDataEntityGroup'
);

export const addDataEntityToGroupActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'addDataEntityToGroup'
);

export const deleteDataEntityFromGroupActionType = createActionType(
  dataEntitiesActionTypePrefix,
  'deleteDataEntityFromGroup'
);
