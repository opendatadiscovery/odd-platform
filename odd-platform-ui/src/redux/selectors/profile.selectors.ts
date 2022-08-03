import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { ProfileState, RootState } from 'redux/interfaces';

const profileState = ({ profile }: RootState): ProfileState => profile;

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner
);

export const getIdentityFetchingStatuses = createStatusesSelector(
  actions.fetchIdentityActionType
);
