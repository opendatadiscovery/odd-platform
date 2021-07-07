import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, ProfileState } from 'redux/interfaces';

export const initialState: ProfileState = {};

const reducer = (state = initialState, action: Action): ProfileState => {
  switch (action.type) {
    case getType(actions.fetchIdentityAction.success):
      return action.payload
        ? {
            ...state,
            owner: action.payload,
          }
        : state;
    default:
      return state;
  }
};

export default reducer;
