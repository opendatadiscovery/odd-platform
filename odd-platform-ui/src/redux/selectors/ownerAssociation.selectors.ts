import { OwnerAssociationState, RootState } from 'redux/interfaces';
import { ownerAssociationAdapter } from 'redux/reducers/ownerAssociation.slice';
import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

export const ownerAssociationState = ({
  ownerAssociation,
}: RootState): OwnerAssociationState => ownerAssociation;

export const { selectAll: getNewAssociationRequestsList } =
  ownerAssociationAdapter.getSelectors<RootState>(
    state => state.ownerAssociation.newRequests
  );

export const { selectAll: getResolvedAssociationRequestsList } =
  ownerAssociationAdapter.getSelectors<RootState>(
    state => state.ownerAssociation.resolvedRequests
  );

export const getNewOwnerAssociationRequestsPageInfo = createSelector(
  ownerAssociationState,
  ownerAssociationRequestsList =>
    ownerAssociationRequestsList.newRequests.pageInfo
);

export const getResolvedOwnerAssociationRequestsPageInfo = createSelector(
  ownerAssociationState,
  ownerAssociationRequestsList =>
    ownerAssociationRequestsList.resolvedRequests.pageInfo
);

export const getOwnerAssociationRequestsListFetchingStatuses =
  createStatusesSelector(
    actions.fetchOwnerAssociationRequestsListActionType
  );

export const getOwnerAssociationRequestCreatingStatuses =
  createStatusesSelector(actions.createOwnerAssociationRequestActionType);

export const getOwnerAssociationRequestUpdatingStatuses =
  createStatusesSelector(actions.updateOwnerAssociationRequestActionType);
