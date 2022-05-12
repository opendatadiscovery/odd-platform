import { createAction } from 'redux/lib/helpers';
import { termsActionPrefix } from 'redux/actions/terms.actions';

export const dataEntitiesActionPrefix = 'dataEntities';

export const fetchDataEntitiesClassesAndTypesAction = createAction(
  dataEntitiesActionPrefix,
  'fetchDataEntityClassesAndTypes'
);

export const fetchDataEntityDetailsAction = createAction(
  dataEntitiesActionPrefix,
  'fetchDataEntityDetails'
);

export const updateDataEntityTagsAction = createAction(
  dataEntitiesActionPrefix,
  'updateDataEntityTags'
);

export const updateDataEntityInternalDescriptionAction = createAction(
  dataEntitiesActionPrefix,
  'updateDataEntityInternalDescription'
);

export const updateDataEntityInternalNameAction = createAction(
  dataEntitiesActionPrefix,
  'updateDataEntityInternalName'
);

export const fetchMyDataEntitiesAction = createAction(
  dataEntitiesActionPrefix,
  'fetchMyDataEntities'
);

export const fetchMyUpstreamDataEntitiesAction = createAction(
  dataEntitiesActionPrefix,
  'fetchMyUpstreamDataEntities'
);

export const fetchMyDownstreamDataEntitiesAction = createAction(
  dataEntitiesActionPrefix,
  'fetchMyDownstreamDataEntities'
);

export const fetchPopularDataEntitiesAction = createAction(
  dataEntitiesActionPrefix,
  'fetchMyPopularDataEntities'
);

// data entity groups
export const createDataEntityGroupAction = createAction(
  dataEntitiesActionPrefix,
  'createDataEntityGroup'
);
export const updateDataEntityGroupAction = createAction(
  dataEntitiesActionPrefix,
  'updateDataEntityGroup'
);
export const deleteDataEntityGroupAction = createAction(
  dataEntitiesActionPrefix,
  'deleteDataEntityGroup'
);

// terms
export const addDataEntityTermAction = createAction(
  termsActionPrefix,
  'addDataEntityTerm'
);

export const deleteDataEntityTermAction = createAction(
  termsActionPrefix,
  'deleteDataEntityTerm'
);
