import { createActionType } from 'lib/redux/helpers';

export const ownersActionTypePrefix = 'owners';

export const fetchOwnersAction = createActionType(
  ownersActionTypePrefix,
  'fetchOwners'
);

export const fetchRolesAction = createActionType(
  ownersActionTypePrefix,
  'fetchOwnershipRoles'
);

export const createOwnerAction = createActionType(
  ownersActionTypePrefix,
  'createOwner'
);

export const updateOwnerAction = createActionType(
  ownersActionTypePrefix,
  'updateOwner'
);

export const deleteOwnerAction = createActionType(
  ownersActionTypePrefix,
  'deleteOwner'
);

export const createDataEntityOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'createDataEntityOwnership'
);

export const updateDataEntityOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'updateDataEntityOwnership'
);

export const deleteDataEntityOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'deleteDataEntityOwnership'
);

export const createTermOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'createTermOwnership'
);

export const updateTermOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'updateTermOwnership'
);

export const deleteTermOwnershipAction = createActionType(
  ownersActionTypePrefix,
  'deleteTermOwnership'
);
