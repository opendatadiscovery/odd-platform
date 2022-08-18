import { createActionType } from 'lib/redux/helpers';

export const tagsActionTypePrefix = 'tags';

export const fetchTagsActionType = createActionType(
  tagsActionTypePrefix,
  'fetchTags'
);

export const createTagsActionType = createActionType(
  tagsActionTypePrefix,
  'createTags'
);

export const updateTagActionType = createActionType(
  tagsActionTypePrefix,
  'updateTags'
);

export const deleteTagActionType = createActionType(
  tagsActionTypePrefix,
  'deleteTag'
);
