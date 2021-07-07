import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { ProfileState } from '../interfaces/state';

const profileState = ({ profile }: RootState): ProfileState => profile;

const getIdentityFetchingStatus = createFetchingSelector('GET_IDENTITY');

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
