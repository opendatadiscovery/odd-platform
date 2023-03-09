import type { OwnerAssociationState, RootState, CurrentPageInfo } from 'redux/interfaces';
import { createSelector } from '@reduxjs/toolkit';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { ownerAssociationAdapter } from 'redux/slices/ownerAssociation.slice';

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
  (ownerAssociationRequestsList): CurrentPageInfo =>
    ownerAssociationRequestsList.newRequests.pageInfo
);

export const getResolvedOwnerAssociationRequestsPageInfo = createSelector(
  ownerAssociationState,
  (ownerAssociationRequestsList): CurrentPageInfo =>
    ownerAssociationRequestsList.resolvedRequests.pageInfo
);

export const getOwnerAssociationRequestsListFetchingStatuses = createStatusesSelector(
  actions.fetchOwnerAssociationRequestsListActionType
);

export const getOwnerAssociationRequestsListFetchingError = createErrorSelector(
  actions.fetchOwnerAssociationRequestsListActionType
);

export const getOwnerAssociationRequestCreatingStatuses = createStatusesSelector(
  actions.createOwnerAssociationRequestActionType
);
