import { createSelector } from '@reduxjs/toolkit';
import { RootState, ProfileState } from 'redux/interfaces';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';

const profileState = ({ profile }: RootState): ProfileState => profile;

const getIdentityFetchingStatus =
  createLegacyFetchingSelector('GET_IDENTITY');

export const getIdentityFetching = createSelector(
  getIdentityFetchingStatus,
  status => status === 'fetching'
);

export const getIdentityFetched = createSelector(
  getIdentityFetchingStatus,
  status => status === 'fetched'
);

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner
);
