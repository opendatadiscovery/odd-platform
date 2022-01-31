import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { Action, AppInfoState } from 'redux/interfaces';

export const initialState: AppInfoState = { appInfo: {} };

const reducer = (state = initialState, action: Action): AppInfoState => {
  console.log(action);
  switch (action.type) {
    case getType(actions.fetchAppInfo.success):
      return action.payload
        ? { ...state, appInfo: action.payload }
        : state;
    default:
      return state;
  }
};

export default reducer;
