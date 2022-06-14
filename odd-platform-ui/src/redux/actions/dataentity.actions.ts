import { createActionType } from 'lib/redux/helpers';
import { termsActionTypePrefix } from 'redux/actions/terms.actions';

export const dataEntitiesActionTypePrefix = 'dataEntities';

export const fetchDataEntitiesClassesAndTypesAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchDataEntityClassesAndTypes'
);

export const fetchDataEntityDetailsAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchDataEntityDetails'
);

export const updateDataEntityTagsAction = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityTags'
);

export const updateDataEntityInternalDescriptionAction = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityInternalDescription'
);

export const updateDataEntityInternalNameAction = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityInternalName'
);

export const fetchMyDataEntitiesAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyDataEntities'
);

export const fetchMyUpstreamDataEntitiesAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyUpstreamDataEntities'
);

export const fetchMyDownstreamDataEntitiesAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyDownstreamDataEntities'
);

export const fetchPopularDataEntitiesAction = createActionType(
  dataEntitiesActionTypePrefix,
  'fetchMyPopularDataEntities'
);

// data entity groups
export const createDataEntityGroupAction = createActionType(
  dataEntitiesActionTypePrefix,
  'createDataEntityGroup'
);
export const updateDataEntityGroupAction = createActionType(
  dataEntitiesActionTypePrefix,
  'updateDataEntityGroup'
);
export const deleteDataEntityGroupAction = createActionType(
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

// terms
export const addDataEntityTermAction = createActionType(
  termsActionTypePrefix,
  'addDataEntityTerm'
);

export const deleteDataEntityTermAction = createActionType(
  termsActionTypePrefix,
  'deleteDataEntityTerm'
);
