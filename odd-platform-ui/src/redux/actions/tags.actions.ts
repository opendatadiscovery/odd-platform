import { createActionType } from 'redux/lib/helpers';

export const tagsActTypePrefix = 'tags';

export const fetchTagsActType = createActionType(tagsActTypePrefix, 'fetchTags');
export const createTagsActType = createActionType(tagsActTypePrefix, 'createTags');
export const updateTagActType = createActionType(tagsActTypePrefix, 'updateTags');
export const deleteTagActType = createActionType(tagsActTypePrefix, 'deleteTag');
