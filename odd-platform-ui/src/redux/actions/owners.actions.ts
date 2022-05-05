import { createAction } from 'lib/helpers';

export const ownersActionPrefix = 'owners';

export const fetchOwnersAction = createAction(
  ownersActionPrefix,
  'fetchOwners'
);

export const fetchRolesAction = createAction(
  ownersActionPrefix,
  'fetchOwnershipRoles'
);

export const createOwnerAction = createAction(
  ownersActionPrefix,
  'createOwner'
);

export const updateOwnerAction = createAction(
  ownersActionPrefix,
  'updateOwner'
);

export const deleteOwnerAction = createAction(
  ownersActionPrefix,
  'deleteOwner'
);

export const createDataEntityOwnershipAction = createAction(
  ownersActionPrefix,
  'createDataEntityOwnership'
);

export const updateDataEntityOwnershipAction = createAction(
  ownersActionPrefix,
  'updateDataEntityOwnership'
);

export const deleteDataEntityOwnershipAction = createAction(
  ownersActionPrefix,
  'deleteDataEntityOwnership'
);
