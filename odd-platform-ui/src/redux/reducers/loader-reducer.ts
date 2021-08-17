import { Action, LoaderState } from 'redux/interfaces';
import { get } from 'lodash';

export const initialState: LoaderState = {
  statuses: {},
  errors: {},
};

const reducer = (state = initialState, action: Action): LoaderState => {
  const { type } = action;
  const matches = /(.*)__(REQUEST|SUCCESS|FAILURE)$/.exec(type);

  // not a *__REQUEST / *__SUCCESS /  *__FAILURE actions, so we ignore them
  if (!matches) return state;
  console.log(action);
  const [, requestName, requestState] = matches;
  switch (requestState) {
    case 'REQUEST':
      return {
        ...state,
        statuses: {
          ...state.statuses,
          [requestName]: 'fetching',
        }
      };
    case 'SUCCESS':
      return {
        ...state,
        statuses: {
          ...state.statuses,
          [requestName]: 'fetched',
        }
      };
    case 'FAILURE':
      return {
        ...state,
        statuses: {
          ...state.statuses,
          [requestName]: 'errorFetching',
        },
        errors: {
          ...state.errors,
          [requestName]: get(action, 'payload'),
        }
      };
    default:
      return state;
  }
};

export default reducer;
