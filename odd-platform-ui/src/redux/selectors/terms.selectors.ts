import { createSelector } from 'reselect';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { getDataEntityId } from 'redux/selectors/dataentity.selectors';
import { TermsState, RootState } from 'redux/interfaces';

const getTermCreationStatus = createFetchingSelector('POST_TERM');
const getTermUpdateStatus = createFetchingSelector('PUT_TERM');

const termsState = ({ terms }: RootState): TermsState => terms;

export const getIsTermCreating = createSelector(
  getTermCreationStatus,
  status => status === 'fetching'
);

export const getIsTermUpdating = createSelector(
  getTermUpdateStatus,
  status => status === 'fetching'
);

const getTermDeletionStatus = createFetchingSelector('DELETE_TERM');

export const getIsTermDeleting = createSelector(
  getTermDeletionStatus,
  status => status === 'fetching'
);

export const getDataEntityTerms = createSelector(
  termsState,
  getDataEntityId,
  (terms, dataEntityId) =>
    terms.termsDataEntity[dataEntityId]?.allIds.map(
      id => terms.termsDataEntity[dataEntityId].byId[id]
    ) || []
);
