import { OwnerAssociationState, RootState } from 'redux/interfaces';
import { ownerAssociationAdapter } from 'redux/reducers/ownerAssociation.slice';
import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

export const ownerAssociationState = ({
  ownerAssociation,
}: RootState): OwnerAssociationState => ownerAssociation;

export const { selectAll: getOwnerAssociationRequestsList } =
  ownerAssociationAdapter.getSelectors<RootState>(
    state => state.ownerAssociation
  );

export const getOwnerAssociationRequestsPageInfo = createSelector(
  ownerAssociationState,
  ownerAssociationRequestsList => ownerAssociationRequestsList.pageInfo
);

export const getOwnerAssociationRequestsListFetchingStatuses =
  createStatusesSelector(
    actions.fetchOwnerAssociationRequestsListActionType
  );

export const getOwnerAssociationRequestCreatingStatuses =
  createStatusesSelector(actions.createOwnerAssociationRequestActionType);

export const getOwnerAssociationRequestUpdatingStatuses =
  createStatusesSelector(actions.updateOwnerAssociationRequestActionType);
