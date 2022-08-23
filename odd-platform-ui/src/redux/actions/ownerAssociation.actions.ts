import { createActionType } from 'lib/redux/helpers';

export const ownerAssociationActionPrefix = 'ownerAssociation';

export const createOwnerAssociationRequestActionType = createActionType(
  ownerAssociationActionPrefix,
  'createOwnerAssociation'
);

export const fetchOwnerAssociationRequestsListActionType =
  createActionType(ownerAssociationActionPrefix, 'fetchRequestsList');

export const updateOwnerAssociationRequestActionType = createActionType(
  ownerAssociationActionPrefix,
  'updateOwnerAssociation'
);
