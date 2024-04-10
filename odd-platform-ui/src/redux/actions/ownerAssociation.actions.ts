import { createActionType } from 'redux/lib/helpers';

export const ownerAssociationActionPrefix = 'ownerAssociation';

export const createOwnerAssociationRequestActionType = createActionType(
  ownerAssociationActionPrefix,
  'createOwnerAssociation'
);
