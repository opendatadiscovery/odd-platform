import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

export const getOwnerAssociationRequestCreatingStatuses = createStatusesSelector(
  actions.createOwnerAssociationRequestActionType
);
