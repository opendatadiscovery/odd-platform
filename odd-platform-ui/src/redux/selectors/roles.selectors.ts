import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import type { CurrentPageInfo, RolesState, RootState } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { rolesAdapter } from 'redux/slices/roles.slice';

export const rolesState = ({ roles }: RootState): RolesState => roles;

export const getRolesFetchingStatuses = createStatusesSelector(actions.fetchRolesActType);
export const getRoleCreatingStatuses = createStatusesSelector(actions.createRoleActType);
export const getRoleUpdatingStatuses = createStatusesSelector(actions.updateRoleActType);
export const getRoleDeletingStatuses = createStatusesSelector(actions.deleteRoleActType);

export const { selectAll: getRolesList } = rolesAdapter.getSelectors<RootState>(
  state => state.roles
);

export const getRolesPageInfo = createSelector(
  rolesState,
  (rolesList): CurrentPageInfo => rolesList.pageInfo
);
