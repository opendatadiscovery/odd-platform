import { createSelector } from '@reduxjs/toolkit';
import {
  createStatusesSelector,
  createLegacyFetchingSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { RootState, ProfileState } from 'redux/interfaces';

const profileState = ({ profile }: RootState): ProfileState => profile;

const getIdentityFetchingStatus =
  createLegacyFetchingSelector('GET_IDENTITY');

export const getIdentityFetching = createSelector(
  getIdentityFetchingStatus,
  status => status === 'fetching'
);

export const getIdentityFetchedStatus = createStatusesSelector(
  actions.fetchIdentityActionType
);

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner
);
